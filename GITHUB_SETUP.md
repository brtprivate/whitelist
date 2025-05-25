# 🚀 GitHub Setup Guide

Complete guide to set up your Web3 Whitelist Application on GitHub with automated deployment to Netlify.

## 📋 Prerequisites

- GitHub account
- Git installed on your computer
- Netlify account (for deployment)

## 🔧 Step-by-Step Setup

### 1. Initialize Git Repository

```bash
# Navigate to your project directory
cd d:\test\whitelist

# Initialize git repository
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Web3 whitelist app with e-pound support"
```

### 2. Create GitHub Repository

1. **Go to GitHub.com** and sign in
2. **Click "New repository"** (green button)
3. **Repository settings**:
   - Repository name: `whitelist-app` (or your preferred name)
   - Description: `Mobile-friendly Web3 whitelist application with multi-currency support`
   - Visibility: `Public` (recommended) or `Private`
   - ✅ **Do NOT** initialize with README (we already have one)
   - ✅ **Do NOT** add .gitignore (we already have one)
   - ✅ **Do NOT** add license (we already have one)

4. **Click "Create repository"**

### 3. Connect Local Repository to GitHub

```bash
# Add GitHub remote (replace with your username and repo name)
git remote add origin https://github.com/yourusername/whitelist-app.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

### 4. Set Up Repository Settings

#### A. Branch Protection (Recommended)

1. Go to **Settings** → **Branches**
2. Click **Add rule**
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging

#### B. Repository Topics

1. Go to **Settings** → **General**
2. Add topics: `web3`, `nextjs`, `typescript`, `blockchain`, `whitelist`, `mobile-friendly`

### 5. Set Up Netlify Deployment

#### A. Connect Repository to Netlify

1. **Go to Netlify.com** and sign in
2. **Click "New site from Git"**
3. **Choose GitHub** and authorize Netlify
4. **Select your repository**: `whitelist-app`
5. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `18`

#### B. Environment Variables in Netlify

1. Go to **Site settings** → **Environment variables**
2. Add variables:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = your_project_id
   NEXT_PUBLIC_ALCHEMY_API_KEY = your_alchemy_key
   NODE_VERSION = 18
   ```

### 6. Set Up GitHub Secrets (for CI/CD)

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add repository secrets:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = your_project_id
   NEXT_PUBLIC_ALCHEMY_API_KEY = your_alchemy_key
   NETLIFY_AUTH_TOKEN = your_netlify_token
   NETLIFY_SITE_ID = your_site_id
   ```

#### Getting Netlify Tokens:

**Netlify Auth Token:**
1. Go to Netlify → **User settings** → **Applications**
2. Click **New access token**
3. Copy the token

**Netlify Site ID:**
1. Go to your site dashboard
2. **Site settings** → **General**
3. Copy the **Site ID**

### 7. Configure Repository Features

#### A. Enable Issues and Discussions

1. **Settings** → **General**
2. Features section:
   - ✅ Issues
   - ✅ Discussions (optional)
   - ✅ Projects
   - ✅ Wiki (optional)

#### B. Create Issue Templates

1. **Settings** → **Features** → **Issues** → **Set up templates**
2. Add templates for:
   - Bug reports
   - Feature requests
   - Questions

### 8. Add Repository Badges

Update your README.md with dynamic badges:

```markdown
![Build Status](https://github.com/yourusername/whitelist-app/workflows/Deploy%20to%20Netlify/badge.svg)
![Netlify Status](https://api.netlify.com/api/v1/badges/your-site-id/deploy-status)
![GitHub issues](https://img.shields.io/github/issues/yourusername/whitelist-app)
![GitHub stars](https://img.shields.io/github/stars/yourusername/whitelist-app)
![GitHub forks](https://img.shields.io/github/forks/yourusername/whitelist-app)
```

## 🔄 Workflow Commands

### Daily Development

```bash
# Create new feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create pull request on GitHub
# After review and merge, update main branch
git checkout main
git pull origin main
```

### Release Process

```bash
# Create release branch
git checkout -b release/v1.0.0

# Update version in package.json
# Make final adjustments
git add .
git commit -m "chore: prepare release v1.0.0"

# Push and create PR
git push origin release/v1.0.0

# After merge, create GitHub release
# Tag the release: v1.0.0
```

## 🚀 Deployment Process

1. **Push to main branch** → Triggers GitHub Actions
2. **GitHub Actions runs**:
   - Installs dependencies
   - Runs linting
   - Builds application
   - Deploys to Netlify
3. **Netlify deployment** → Live site updated

## 📊 Monitoring

### GitHub Insights

- **Traffic**: Monitor repository visits
- **Issues**: Track bug reports and features
- **Pull requests**: Review contributions
- **Actions**: Monitor CI/CD pipeline

### Netlify Analytics

- **Deploy logs**: Check build status
- **Site analytics**: Monitor traffic
- **Performance**: Check Core Web Vitals

## 🔧 Troubleshooting

### Common Issues

1. **Build fails**: Check environment variables
2. **Deploy fails**: Verify Netlify configuration
3. **GitHub Actions fail**: Check secrets and permissions

### Getting Help

- Create GitHub issue
- Check GitHub Actions logs
- Review Netlify deploy logs
- Check documentation

## ✅ Checklist

- [ ] Repository created on GitHub
- [ ] Local repository connected to GitHub
- [ ] All files pushed to main branch
- [ ] Netlify connected and configured
- [ ] Environment variables set
- [ ] GitHub secrets configured
- [ ] CI/CD pipeline working
- [ ] Repository settings configured
- [ ] Documentation updated

Your GitHub repository is now fully set up with automated deployment! 🎉
