# Cursor IDE Setup for QS-Ext-Jump-Start

This guide helps you set up Cursor IDE for optimal Qlik Sense extension development using this template.

## Prerequisites

- **Cursor IDE** - Download from [cursor.com](https://cursor.com)
- **Node.js 20+** - [Download](https://nodejs.org/)
- **Git** - For version control
- **Qlik Sense access** - Cloud or Enterprise environment

## Initial Setup

### 1. Install Cursor

Download and install Cursor from the official website. Cursor is built on VS Code, so if you're familiar with VS Code, you'll feel at home.

### 2. Open the Project

```bash
# Clone your repository
git clone <your-repo-url>
cd <your-repo-name>

# Install dependencies
npm install

# Open in Cursor
cursor .
```

### 3. Install Recommended Extensions

Cursor will prompt you to install recommended extensions when you open the project. Click "Install All" or install individually:

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Playwright Test** - Test running and debugging
- **EditorConfig** - Consistent editor settings
- **Markdown All in One** - Enhanced markdown editing
- **GitHub Pull Requests** - Git integration

## Cursor-Specific Features

### AI Code Generation

- **Ctrl+K (Cmd+K on Mac)**: Generate code with AI assistance
- **Ctrl+I (Cmd+I on Mac)**: Multi-file editing and refactoring with Composer
- **Tab**: Accept AI suggestions
- **Escape**: Reject AI suggestions

### AI Chat Integration

- Open the AI chat panel to ask questions about your code
- Ask about Qlik Sense patterns, Nebula.js usage, or debugging help
- Reference the `.cursorrules` file for project-specific context

### Codebase Understanding

Cursor can understand your entire codebase. Ask questions like:

- "How does the selection mechanism work in this extension?"
- "What are the main components of this Qlik Sense extension?"
- "How can I add a new property to the property panel?"

## Project Configuration

The project includes several Cursor-specific configuration files:

### `.cursorrules`

Contains AI assistant rules and project context. This helps Cursor understand:

- Project architecture and patterns
- Coding standards and best practices
- Common tasks and file organization
- What to avoid

### `.cursor/settings.json`

Workspace-specific settings for:

- ESLint and Prettier integration
- File associations (`.qvs` files as SQL)
- Playwright test discovery
- JSON schemas for `meta.json`

### `.cursor/extensions.json`

Recommended and unwanted extensions for the project.

### `.cursor/prompts.md`

Template prompts for common development tasks in this project.

## Development Workflow with Cursor

### 1. Start Development Server

```bash
npm run serve
```

The development server will start at `http://localhost:8000` with hot reload.

### 2. Use AI for Code Generation

When adding new features:

1. Use **Ctrl+K** to describe what you want to build
2. Review and refine the generated code
3. Use **Ctrl+I** for multi-file changes

### 3. Testing with AI Assistance

- Ask Cursor to generate Playwright tests for new features
- Use AI to debug failing tests
- Get help understanding test patterns

### 4. Code Review and Refactoring

- Use Composer (Ctrl+I) for large refactoring tasks
- Ask AI to review your code for improvements
- Get suggestions for performance optimization

## AI Prompt Tips

For better AI responses, be specific about:

1. **Context**: "In this Qlik Sense extension..."
2. **Technology**: "Using Nebula.js hooks..."
3. **Goal**: "I want to add a property that..."
4. **Constraints**: "This should work in Qlik Cloud..."

### Example Prompts

```
Generate a new property for the extension that allows users to select a color theme

Add error handling to the data processing function in src/qae/data.js

Create a Playwright test that verifies the selection behavior works correctly

Help me optimize this component for better performance with large datasets
```

## Troubleshooting

### AI Not Understanding Project Context

1. Check that `.cursorrules` is in the root directory
2. Ensure Cursor has indexed the entire project
3. Try restarting Cursor
4. Be more specific in your prompts

### Extensions Not Working

1. Verify extensions are installed and enabled
2. Check `.cursor/extensions.json` for conflicts
3. Restart Cursor after installing extensions

### Settings Not Applied

1. Check `.cursor/settings.json` syntax
2. Ensure settings are in the correct workspace scope
3. Some settings may require a Cursor restart

## Advanced Features

### Custom AI Instructions

You can customize the `.cursorrules` file to:

- Add project-specific coding patterns
- Include domain knowledge about your business logic
- Define custom linting rules or preferences

### Keyboard Shortcuts

- **Ctrl+Shift+P**: Command palette
- **Ctrl+`**: Toggle terminal
- **Ctrl+B**: Toggle sidebar
- **F1**: Show all commands
- **Ctrl+Shift+E**: Explorer panel

## Next Steps

1. Follow the main [README.md](../README.md) for development workflow
2. Check [TESTING.md](./TESTING.md) for test-specific guidance
3. See [WORKFLOWS.md](./WORKFLOWS.md) for common development tasks
4. Review [KNOWLEDGE_BASE.md](../KNOWLEDGE_BASE.md) for best practices

## Resources

- [Cursor Documentation](https://docs.cursor.com)
- [Qlik Developer Portal](https://qlik.dev/)
- [Nebula.js Documentation](https://qlik.dev/extend/)
- [Project Knowledge Base](../KNOWLEDGE_BASE.md)
