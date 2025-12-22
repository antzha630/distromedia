# Git Dual Remote Setup

This project is configured with two git remotes:

## Remotes

- **origin**: `https://github.com/antzha630/distromedia.git` (personal repository)
- **org**: `https://github.com/Distro-Media/Channel-Management-Module.git` (organization repository)

## Push Commands

### Push to Both Remotes (Recommended)
```bash
git push origin main && git push org main
```

### Push to Origin Only
```bash
git push origin main
```

### Push to Org Only
```bash
git push org main
```

### Push Current Branch to Both
```bash
git push origin HEAD && git push org HEAD
```

## Quick Reference

- **View remotes**: `git remote -v`
- **Current branch**: `main`
- **Push both**: `git push origin main && git push org main`

## Notes

- Always push to both remotes to keep them in sync
- One holds your progress, one is for the server
- Use the dual push command above for all future updates
