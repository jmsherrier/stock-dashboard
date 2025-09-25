# Chatbot Interaction Guidelines

## Core Principles

### Communication Style
- Maintain professional, direct communication without decorative elements
- Provide minimal viable responses that fully address the request
- Avoid unnecessary elaboration or filler content
- Use passive, objective language structures

### Response Format
- Exclude emojis, symbols, or visual decorations unless specifically requested
- Use clear, straightforward language
- Focus on actionable information and direct answers
- Employ passive voice constructions (e.g., "Implementing changes" vs "I'll implement changes")
- Avoid first-person references and conversational transitions

### Scope of Action
- Execute only explicitly requested tasks
- Seek explicit permission before performing additional or related actions
- Do not make assumptions about unstated requirements or preferences

### Documentation Requirements
- Update README.md after implementing changes to reflect current state
- Document new features, interface modifications, and technical updates
- Maintain version tracking and change logs in project documentation
- Unless directed, do not create new .md files - only contribute to and update existing .md files
- Focus on enhancing existing documentation rather than creating additional documentation files

## Implementation
These guidelines ensure efficient, focused interactions that respect user intentions and time constraints while maintaining helpful assistance within defined boundaries.

## Command line / Terminal
Generally, working folder is Whiteboard/momentum-tracker/

### PowerShell Syntax
- Use semicolon (`;`) syntax to join commands on a single line when needed
- Example: `cd .\momentum-tracker\; npm install`
- This ensures compatibility with Windows PowerShell command execution

## Code Modernization & Legacy Cleanup

### Architecture Standards
- Maintain fully modular component architecture using `components` data structure
- All stock data must use modular format: `stock.components.ticker.value` pattern
- Remove legacy format conversion functions when no longer needed
- Eliminate unused components, functions, and API endpoints systematically

### Component Management
- Remove unused components immediately when identified
- Update all imports and references when removing components
- Maintain ComponentRegistry as single source of truth for modular components
- Ensure all component dependencies are properly traced and validated

### Database & API Cleanup
- Remove unused database tables and API routes when functionality is deprecated
- Update server routing to exclude removed endpoints
- Clean up unused API client methods that no longer have corresponding backend routes
- Remove legacy database schema elements that support deprecated features

### Testing & Quality Assurance
- Update test files to remove references to deleted functions and components
- Run tests after major cleanup operations to verify system integrity
- Remove legacy test cases that test deprecated functionality
- Ensure all remaining tests validate current, active code paths

### CSS & Styling
- Remove unused CSS classes and styles for deleted components
- Clean up legacy styles that are no longer referenced in the codebase
- Maintain consistent styling architecture aligned with current component structure

### Documentation Maintenance
- Update ARCHITECTURE.md to reflect current system state
- Remove references to deprecated features in documentation
- Update README.md when major architectural changes are implemented
- Ensure documentation accurately represents the modernized codebase