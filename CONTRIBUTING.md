# Contributing to Web3 Whitelist Application

Thank you for your interest in contributing to our Web3 Whitelist Application! We welcome contributions from the community.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/whitelist-app.git
   cd whitelist-app
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a new branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code style and formatting
- Use meaningful variable and function names
- Add comments for complex logic

### Commit Messages

Use conventional commit messages:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests

Example: `feat: add support for new token currency`

### Testing

- Test your changes thoroughly
- Ensure the application builds successfully: `npm run build`
- Check for linting errors: `npm run lint`
- Test on both mobile and desktop devices

## 🔧 Making Changes

### Adding New Currencies

1. Update `src/lib/contracts.ts`:
   ```typescript
   export const SUPPORTED_CURRENCIES = {
     // ... existing currencies
     NEW_TOKEN: {
       name: 'New Token',
       symbol: 'NEW',
       address: 'contract_address_here',
       decimals: 18,
       icon: '🪙'
     }
   };
   ```

2. Add the token ABI if different from standard ERC20
3. Test the integration thoroughly

### UI/UX Changes

- Maintain mobile-first responsive design
- Keep the clean, simple aesthetic
- Test on various screen sizes
- Ensure accessibility standards

## 📋 Pull Request Process

1. **Update documentation** if needed
2. **Test your changes** thoroughly
3. **Create a pull request** with:
   - Clear title and description
   - Screenshots for UI changes
   - List of changes made
   - Any breaking changes noted

4. **Address review feedback** promptly
5. **Ensure CI passes** before merging

## 🐛 Reporting Issues

When reporting issues, please include:

- **Environment details** (browser, device, OS)
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Console errors** if any

## 💡 Feature Requests

For feature requests:

- Check if the feature already exists
- Explain the use case and benefits
- Provide mockups or examples if applicable
- Consider the impact on mobile users

## 📞 Getting Help

- Create an issue for questions
- Check existing issues and documentation
- Be respectful and patient

## 🙏 Recognition

Contributors will be recognized in the project documentation and release notes.

Thank you for contributing! 🚀
