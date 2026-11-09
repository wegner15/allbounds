"""Pure calculation engine for tour quotes. No DB access."""
import math
from collections import OrderedDict
from typing import Any, Dict, List


def _r(v: float) -> float:
    return round(v + 0.0, 2)


def item_cost(item: Dict[str, Any], pax: int, rooms: int) -> float:
    unit = float(item.get("unit_cost") or 0) + float(item.get("tax_amount") or 0)
    qty = float(item.get("qty") if item.get("qty") is not None else 1)
    basis = item.get("cost_basis", "per_person")
    if basis == "per_person":
        mult = pax
    elif basis == "per_room":
        mult = rooms
    elif basis == "per_vehicle":
        cap = int(item.get("capacity") or 0)
        mult = math.ceil(pax / cap) if cap > 0 else 1
    else:  # per_group, per_booking
        mult = 1
    return unit * qty * mult


def calculate_scenario(quote: Dict[str, Any], scenario: Dict[str, Any]) -> Dict[str, Any]:
    pax = max(1, int(scenario.get("pax") or 1))
    foc = max(0, int(scenario.get("foc_count") or 0))
    rooms = max(0, int(scenario.get("rooms") or 0))
    paying = max(1, pax - foc)

    by_component: "OrderedDict[str, float]" = OrderedDict()
    optional_cost = 0.0
    for it in quote.get("items", []):
        c = item_cost(it, pax, rooms)
        if it.get("is_optional"):
            optional_cost += c
        else:
            ct = it.get("component_type") or "other"
            by_component[ct] = by_component.get(ct, 0.0) + c

    direct = sum(by_component.values())
    contingency = direct * float(quote.get("contingency_percent") or 0) / 100
    total_cost = direct + contingency

    method = quote.get("pricing_method", "markup")
    v = float(quote.get("pricing_value") or 0)
    if method == "margin":
        if v >= 100:
            raise ValueError("Target margin must be below 100%")
        gross = total_cost / (1 - v / 100)
    else:
        gross = total_cost * (1 + v / 100)

    discount_total = 0.0
    for d in quote.get("discounts", []):
        val = float(d.get("value") or 0)
        if d.get("mode") == "percent":
            discount_total += gross * val / 100
        elif d.get("scope") == "per_person":
            discount_total += val * paying
        else:
            discount_total += val
    discount_total = min(discount_total, gross)
    net = gross - discount_total  # price before tax-adjustment

    tax_amount = 0.0
    if quote.get("tax_enabled") and float(quote.get("tax_rate") or 0) > 0:
        rate = float(quote["tax_rate"]) / 100
        if quote.get("tax_inclusive"):
            tax_amount = net - net / (1 + rate)
            net_ex_tax = net - tax_amount
            final_total = net
        else:
            net_ex_tax = net
            tax_amount = net * rate
            final_total = net + tax_amount
    else:
        net_ex_tax = net
        final_total = net

    profit = net_ex_tax - total_cost
    margin = (profit / net_ex_tax * 100) if net_ex_tax > 0 else 0.0
    markup_applied = (profit / total_cost * 100) if total_cost > 0 else 0.0

    per_person = final_total / paying
    # Optional extras: priced with the same pricing method, shown separately
    if method == "margin":
        opt_sell = optional_cost / (1 - v / 100)
    else:
        opt_sell = optional_cost * (1 + v / 100)

    return {
        "scenario_id": scenario.get("id"),
        "label": scenario.get("label"),
        "pax": pax, "foc_count": foc, "paying_pax": paying, "rooms": rooms,
        "cost_by_component": {k: _r(x) for k, x in by_component.items()},
        "direct_cost": _r(direct),
        "contingency": _r(contingency),
        "total_cost": _r(total_cost),
        "selling_price_before_discount": _r(gross),
        "discount_total": _r(discount_total),
        "price_before_tax": _r(net_ex_tax),
        "tax_amount": _r(tax_amount),
        "final_total": _r(final_total),
        "price_per_person": _r(per_person),
        "price_per_room": _r(final_total / rooms) if rooms else None,
        "expected_profit": _r(profit),
        "profit_margin_percent": _r(margin),
        "effective_markup_percent": _r(markup_applied),
        "optional_cost": _r(optional_cost),
        "optional_price_per_person": _r(opt_sell / paying),
    }


def calculate_quote(quote: Dict[str, Any]) -> List[Dict[str, Any]]:
    return [calculate_scenario(quote, s) for s in quote.get("scenarios", [])]


def allocate_invoice_lines(quote: Dict[str, Any], result: Dict[str, Any], pax: int, rooms: int):
    """Split the pre-tax price across components in proportion to direct cost.

    Returns a list of (component_type, description, price, cost). Rounding drift is
    absorbed by the last line so the lines sum exactly to price_before_tax.
    """
    comps = result["cost_by_component"]
    direct = sum(comps.values()) or 0.0
    target = result["price_before_tax"]
    lines = []
    allocated = 0.0
    keys = list(comps.keys())
    for i, k in enumerate(keys):
        if i == len(keys) - 1:
            price = _r(target - allocated)
        else:
            price = _r(target * (comps[k] / direct)) if direct else 0.0
            allocated += price
        lines.append((k, comps[k], price))
    return lines
