# Visual Guide: Documentation Components

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ ToolPageHeader                                               │
│ "Metadata Editor" / "AES Encryption"                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ℹ️  What is Photo Metadata?                          [▼]    │  ← Tier 1: LearnMorePanel
├─────────────────────────────────────────────────────────────┤    (Collapsed by default after first visit)
│ Photo metadata is hidden information embedded...            │
│ • GPS Location - Exact coordinates...                       │
│ • Camera/Phone Model - Device manufacturer...               │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ ⚠️  Privacy Warning: Most smartphone photos contain...  ││  ← Tier 3: EducationalAlert
│ └─────────────────────────────────────────────────────────┘│    (Nested inside panel)
│                                                              │
│ Common use cases: Remove metadata before...                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 📷  Edit image metadata                                     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐│
│ │ ℹ️  Privacy Tip: Photos often contain GPS...           ││  ← Tier 3: EducationalAlert
│ └─────────────────────────────────────────────────────────┘│    (Standalone in section)
│                                                              │
│ [Select Image]                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 📋  Categories  ℹ️                                          │  ← Tier 2: InfoTooltip
│                  └─ Hover shows tooltip                     │    (Next to section title)
└─────────────────────────────────────────────────────────────┘
```

---

## Tier 1: LearnMorePanel

### Visual States

**First Visit (Auto-Expanded):**
```
┌───────────────────────────────────────────────┐
│ ℹ️  What is AES Encryption?            [▲]   │
├───────────────────────────────────────────────┤
│                                                │
│ AES (Advanced Encryption Standard) is a       │
│ military-grade encryption algorithm...        │
│                                                │
│ • AES-256 - 256-bit keys (strongest)          │
│ • Password-based encryption                   │
│ • Unbreakable with strong password            │
│                                                │
│ ┌─────────────────────────────────────────┐  │
│ │ ⚠️  Important: If you forget your      │  │
│ │    password, data cannot be recovered  │  │
│ └─────────────────────────────────────────┘  │
│                                                │
│ Common use cases: Encrypt sensitive...        │
│                                                │
└───────────────────────────────────────────────┘
```

**Returning Visit (Collapsed):**
```
┌───────────────────────────────────────────────┐
│ ℹ️  What is AES Encryption?            [▼]   │
└───────────────────────────────────────────────┘
   ↑ Click to expand
```

### Color Scheme
- **Background:** `info-darken-3` (dark blue tint)
- **Icon:** `mdi-help-circle-outline` in `info` color
- **Text:** Standard body text (`text-body-2`)

---

## Tier 2: InfoTooltip

### Visual Example

**Idle State:**
```
┌───────────────────────────────────────┐
│ 🔑  Password Protection  ℹ️           │
└───────────────────────────────────────┘
                            ↑ Small info icon
```

**On Hover:**
```
┌───────────────────────────────────────┐
│ 🔑  Password Protection  ℹ️           │
│                    ┌──────────────────┴────────┐
│                    │ Password strength directly │
│                    │ determines encryption      │
│                    │ security. A weak password  │
│                    │ can be cracked in minutes. │
│                    └────────────────────────────┘
└───────────────────────────────────────┘
```

### Placement Options
- **In Card Headers:** Next to section titles
- **Next to Labels:** Next to technical terms
- **Inline with Text:** For specific explanations

### Size Comparison
```
Normal text: Categories
With tooltip: Categories ℹ️  ← Small, non-intrusive
```

---

## Tier 3: EducationalAlert

### Visual Variants

**Info Alert (Type: info):**
```
┌─────────────────────────────────────────────┐
│ ℹ️  Password Strength Matters: Use at      │
│    least 12 characters with a mix of        │
│    uppercase, lowercase, numbers...         │
└─────────────────────────────────────────────┘
```

**Warning Alert (Type: warning):**
```
┌─────────────────────────────────────────────┐
│ ⚠️  Privacy Warning: Most smartphone       │
│    photos contain GPS coordinates that      │
│    reveal your exact location...            │
└─────────────────────────────────────────────┘
```

### Density Options
- **Compact** (default): Single line with minimal padding
- **Comfortable**: More breathing room
- **Default**: Full padding

---

## Layout Examples

### Metadata Editor Page Flow

```
┌─────────────────────────────────────────────────────┐
│ ToolPageHeader: "Metadata Editor"                   │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ LearnMorePanel: "What is Photo Metadata?" [▼]      │
│ (Auto-expands on first visit)                       │
└─────────────────────────────────────────────────────┘
         ↓
┌──────────────────────┬──────────────────────────────┐
│ SIDEBAR (35%)        │ CONTENT (65%)                │
│                      │                               │
│ ┌──────────────────┐ │ ┌───────────────────────┐   │
│ │ Edit image       │ │ │ Categories  ℹ️         │   │
│ │                  │ │ │ ↑ InfoTooltip         │   │
│ │ ┌──────────────┐ │ │ └───────────────────────┘   │
│ │ │ ℹ️ Privacy   │ │ │                               │
│ │ │   Tip: Photos│ │ │                               │
│ │ └──────────────┘ │ │                               │
│ │ ↑ Alert          │ │                               │
│ │                  │ │                               │
│ │ [Select Image]   │ │                               │
│ └──────────────────┘ │                               │
└──────────────────────┴──────────────────────────────┘
```

### AES Encrypt Page Flow

```
┌─────────────────────────────────────────────────────┐
│ ToolPageHeader: "AES Encryption"                    │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ LearnMorePanel: "What is AES Encryption?" [▼]      │
│ (Auto-expands on first visit)                       │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ Error Alert (if any)                                │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ 🔑  Password Protection  ℹ️                         │
│     ↑ InfoTooltip                                   │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐│
│ │ ℹ️  Password Strength Matters: Use 12+ chars   ││
│ └─────────────────────────────────────────────────┘│
│ ↑ EducationalAlert                                  │
│                                                      │
│ Password: [__________]                              │
│ Confirm:  [__________]                              │
│ PasswordStrengthIndicator (existing component)      │
└─────────────────────────────────────────────────────┘
```

---

## Mobile Responsive Behavior

### Desktop (>1024px)
```
┌─────────────────────────────────────────────────────┐
│ LearnMorePanel: Full width, comfortable padding    │
└─────────────────────────────────────────────────────┘
┌──────────────────┬──────────────────────────────────┐
│ Sidebar 35%      │ Content 65%                      │
│                  │                                   │
│ InfoTooltip      │ Shows on hover                   │
└──────────────────┴──────────────────────────────────┘
```

### Tablet (768px - 1023px)
```
┌─────────────────────────────────────────────────────┐
│ LearnMorePanel: Full width, slightly less padding  │
└─────────────────────────────────────────────────────┘
┌──────────────────┬──────────────────────────────────┐
│ Sidebar 40%      │ Content 60%                      │
│                  │                                   │
│ InfoTooltip      │ Shows on tap (mobile browsers)   │
└──────────────────┴──────────────────────────────────┘
```

### Mobile (<768px)
```
┌───────────────────────────────────────┐
│ LearnMorePanel: Full width, compact  │
└───────────────────────────────────────┘
┌───────────────────────────────────────┐
│ Sidebar: Stacked full width           │
└───────────────────────────────────────┘
┌───────────────────────────────────────┐
│ Content: Stacked full width           │
│                                        │
│ InfoTooltip: Tap to show               │
└───────────────────────────────────────┘
```

---

## Color Palette

### LearnMorePanel
- **Panel Background:** `info-darken-3` (Vuetify theme color)
- **Icon Color:** `info` (blue)
- **Text Color:** Default (high contrast)

### InfoTooltip
- **Icon Color:** `info` (blue) - customizable via prop
- **Tooltip Background:** Vuetify default (dark gray)
- **Tooltip Text:** White

### EducationalAlert
- **Info Type:** Light blue background, blue border
- **Warning Type:** Light orange background, orange border
- **Error Type:** Light red background, red border
- **Success Type:** Light green background, green border

---

## Spacing System

All components use Vuetify spacing utilities:

```
mb-2  = margin-bottom: 8px
mb-3  = margin-bottom: 12px
mb-4  = margin-bottom: 16px
mt-3  = margin-top: 12px
ml-4  = margin-left: 16px
pa-4  = padding: 16px
```

---

## Typography Scale

```
text-body-2         = 14px (educational content)
text-caption        = 12px (hints, metadata)
font-weight-medium  = 500 (panel titles)
```

---

## Accessibility Features

### Keyboard Navigation
- ✅ LearnMorePanel: Tab to focus, Enter/Space to expand
- ✅ InfoTooltip: Tab to focus, tooltip shows on focus
- ✅ EducationalAlert: Readable by screen readers

### Screen Reader Support
- ✅ All icons have proper aria-labels
- ✅ Tooltips have descriptive text
- ✅ Alerts use semantic HTML

### Color Contrast
- ✅ All text meets WCAG AA standards (4.5:1 minimum)
- ✅ Icons use high-contrast colors
- ✅ Alerts use sufficient color differentiation

---

## Animation & Transitions

### LearnMorePanel
- **Expand/Collapse:** Smooth accordion animation (Vuetify default)
- **Duration:** ~300ms
- **Easing:** ease-in-out

### InfoTooltip
- **Show/Hide:** Fade in/out
- **Duration:** ~150ms
- **Delay:** 200ms (prevents accidental triggers)

### EducationalAlert
- **Static:** No animations (immediate display)

---

## Best Practices

### Content Guidelines
1. **Keep it concise:** 2-4 paragraphs maximum
2. **Use bullet points:** For lists of features
3. **Bold key terms:** For emphasis
4. **Include use cases:** Real-world examples
5. **Limit alerts:** 1 per section maximum

### Placement Guidelines
1. **LearnMorePanel:** After page header, before main content
2. **InfoTooltip:** Next to technical terms or section headers
3. **EducationalAlert:** In context (e.g., password section for password tips)

### Don't Overuse
- ❌ Don't add tooltips to every heading
- ❌ Don't stack multiple alerts
- ❌ Don't write essay-length panel content
- ✅ Be selective and strategic
- ✅ Focus on high-value information
- ✅ Respect user's time and attention
