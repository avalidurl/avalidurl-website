# Contributing to avalidurl-website

Thank you for your interest in contributing to this project! This guide will help you get started with contributing to our Astro-based blog system with Substack import capabilities.

## 🎯 Ways to Contribute

- **Bug Reports**: Found a bug? Help us fix it!
- **Feature Requests**: Have an idea for improvement?
- **Code Contributions**: Submit pull requests for fixes and features
- **Documentation**: Improve guides, comments, and examples
- **Substack Import Tools**: Enhance the migration system
- **Testing**: Help test with different Substack exports

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Git

### Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub, then:
   git clone https://github.com/yourusername/avalidurl-website.git
   cd avalidurl-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📋 Development Guidelines

### Code Style

- **TypeScript**: Use TypeScript for type safety where possible
- **Formatting**: Follow existing code formatting patterns
- **Comments**: Add meaningful comments for complex logic
- **Naming**: Use descriptive variable and function names

### Project Structure

```
avalidurl-website/
├── src/
│   ├── components/     # Reusable Astro components
│   ├── content/        # Content collections
│   ├── layouts/        # Page layouts
│   ├── pages/          # Route pages
│   └── utils/          # Utility functions
├── scripts/            # Import and build scripts
├── public/             # Static assets
└── docs/               # Documentation
```

### Astro Best Practices

- Use `.astro` files for components with markup
- Use TypeScript for utilities and complex logic
- Follow Astro's content collections pattern
- Optimize images using Astro's image optimization

## 🛠 Substack Import Contributions

The Substack import system is a key feature. When contributing:

### Testing Import Scripts

1. **Test with real data**
   ```bash
   # Use a small Substack export for testing
   npm run import-substack
   ```

2. **Test edge cases**
   - Posts with complex formatting
   - Multiple image types
   - Various embed formats
   - Special characters in titles

3. **Verify output quality**
   - Check generated Markdown
   - Ensure images are downloaded
   - Verify frontmatter accuracy

### Import Script Guidelines

- **Error Handling**: Always include proper error handling
- **Rate Limiting**: Respect external services with delays
- **Logging**: Provide clear progress indicators
- **Rollback**: Consider how to undo changes if needed
- **Configuration**: Make settings easily configurable

## 🧪 Testing

### Manual Testing

1. **Basic functionality**
   ```bash
   npm run dev
   # Test blog pages, navigation, embeds
   ```

2. **Build testing**
   ```bash
   npm run build
   npm run preview
   ```

3. **Import testing**
   ```bash
   # Test with sample Substack export
   npm run import-substack
   ```

### Content Testing

- Test with various Markdown formats
- Verify embed components render correctly
- Check responsive design on different devices
- Validate SEO metadata

## 🐛 Bug Reports

Use the bug report template and include:

- **Environment**: OS, Node.js version, npm version
- **Steps to reproduce**: Clear, numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Sample content**: Relevant Substack export samples (anonymized)

### Bug Report Template

```markdown
**Environment:**
- OS: [e.g., macOS 14.0]
- Node.js: [e.g., 18.17.0]
- npm: [e.g., 9.8.0]

**Description:**
A clear description of the bug.

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. Run command '...'
4. See error

**Expected Behavior:**
What you expected to happen.

**Actual Behavior:**
What actually happened.

**Additional Context:**
- Screenshots if applicable
- Error messages
- Sample content that causes the issue
```

## ✨ Feature Requests

Use the feature request template and include:

- **Problem**: What problem does this solve?
- **Solution**: Your proposed solution
- **Alternatives**: Other solutions you've considered
- **Use Cases**: How would this be used?

## 🔄 Pull Request Process

### Before Submitting

1. **Test thoroughly**
   - Manual testing on different content
   - Build and preview the site
   - Test import functionality if relevant

2. **Update documentation**
   - Update README if needed
   - Add or update comments
   - Update guides for new features

3. **Clean commit history**
   ```bash
   # Squash related commits
   git rebase -i HEAD~n
   ```

### PR Guidelines

- **Clear title**: Describe what the PR does
- **Detailed description**: Explain the changes and why
- **Link issues**: Reference related issues
- **Screenshots**: Include before/after screenshots if relevant

### PR Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Substack import improvement
- [ ] Performance improvement

## How Has This Been Tested?
- [ ] Manual testing
- [ ] Substack import testing
- [ ] Build testing
- [ ] Cross-browser testing

## Screenshots (if applicable)
Before/after screenshots

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings or errors
```

## 🏷 Commit Messages

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```
feat(import): add support for Bandcamp embeds
fix(images): handle images with special characters in filenames
docs(readme): update installation instructions
refactor(utils): simplify date formatting function
```

## 🌟 Areas for Contribution

### High Priority
- **Import System Enhancements**
  - Support for more embed types
  - Better error recovery
  - Batch processing improvements
  - Custom field mapping

- **Content Management**
  - Tag management system
  - Content search functionality
  - Related posts suggestions

### Medium Priority
- **Performance Optimizations**
  - Image optimization pipeline
  - Build time improvements
  - Bundle size reduction

- **Developer Experience**
  - Better debugging tools
  - More comprehensive error messages
  - Development tooling improvements

### Community Requests
- Multi-language support
- Theme customization system
- Plugin architecture
- Analytics integration

## 🤝 Community Guidelines

- **Be respectful**: Treat everyone with respect and kindness
- **Be helpful**: Help others learn and contribute
- **Be patient**: Remember that people have different experience levels
- **Be collaborative**: Work together to improve the project

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Documentation**: Check existing guides and README
- **Code Comments**: Look at inline documentation

## 🏆 Recognition

Contributors will be:
- Listed in the project README
- Mentioned in release notes for significant contributions
- Invited to participate in project direction discussions

## 📜 License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers the project.

---

**Thank you for contributing!** Every contribution, no matter how small, helps make this project better for everyone.