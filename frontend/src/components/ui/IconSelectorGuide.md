# IconSelector Component

The `IconSelector` component provides an intuitive way for admins to choose icons for holiday types. It combines a visual icon picker with a custom input field for maximum flexibility.

## Features

- **Visual Icon Grid**: 60+ predefined icons organized by category (Travel, Adventure, Luxury, etc.)
- **Custom Input**: Allows entering any emoji or icon character
- **Selected Icon Display**: Shows the currently selected icon with clear/remove option
- **Responsive Design**: Works on all screen sizes with proper grid layout
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Usage

```tsx
import IconSelector from '../../../components/ui/IconSelector';

<IconSelector
  selectedIcon={selectedIcon}
  onIconSelect={setSelectedIcon}
  label="Holiday Type Icon"
  helperText="Choose an icon to represent this holiday type"
/>
```

## Props

- `selectedIcon?: string` - The currently selected icon
- `onIconSelect: (icon: string) => void` - Callback when an icon is selected
- `label?: string` - Label text for the component
- `helperText?: string` - Helper text displayed below the label

## Icon Categories

The component includes icons from these categories:

- **Travel & Vacation**: ✈️, 🏖️, 🏔️, 🏙️, 🚢, 🗽, 🏛️, 🌴, 🏜️, 🏕️
- **Adventure & Activities**: 🦁, 🧗‍♂️, ⛷️, 🏊‍♀️, 🚣, 🏇, 🎣, 🏂, 🪂, 🏃‍♂️
- **Luxury & Romance**: 💎, 💑, 💍, 🏰, 🍾, 🍷, 🍽️, 🛥️, 🏨, 🌟
- **Family & Groups**: 👨‍👩‍👧‍👦, 👨‍👩‍👧, 👨‍👩‍👦, 👨‍👩‍👧‍👦‍👦, 👨‍👩‍👦‍👦
- **Food & Culture**: 🍽️, 🍷, 🏺, 🎭, 🎨, 🏛️, 🎪, 🎡, 🎢, 🎠
- **Sports & Active**: ⚽, 🏀, 🏈, ⚾, 🎾, 🏐, 🏓, 🏸, 🎱, 🎯
- **Business & Corporate**: 🏆, 🎤, 📊, 💼, 🤝, 📈, 🏢, 💻, 📱, 📋
- **Education & Learning**: 🎒, 📚, 🎓, 🧠, 🔬, 🧪, 🌍, 🗺️, 📖, ✏️
- **Wellness & Relaxation**: 🧘‍♀️, 🛀, 💆‍♀️, 🌿, 🌸, 🌺, 🌻, 🌹, 🌷, 🌼
- **Seasonal & Special**: 🎄, 🎅, 🦃, 🎃, 👻, 🦇, 🎆, 🎇, 🎊, 🎉

## Integration

The IconSelector is integrated into the HolidayTypeForm component, allowing admins to:

1. Browse and select from predefined icons
2. Enter custom emojis or icons
3. See a preview of the selected icon
4. Clear the selection if needed

The selected icon is stored in the `icon` field of the holiday type and used throughout the application for visual representation.