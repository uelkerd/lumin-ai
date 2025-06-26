# Git LFS Guide for LUMIN.AI

This document provides guidelines for working with Git Large File Storage (LFS) in the LUMIN.AI project.

## What is Git LFS?

Git LFS is an extension to Git that replaces large files with text pointers inside Git, while storing the file contents on a remote server. This helps keep the Git repository size manageable while still allowing version control of large files.

## When to Use Git LFS

Use Git LFS for:

- **Large datasets** (CSV, JSON, Parquet, etc.)
- **Machine learning models** (PKL, H5, PT, etc.)
- **Media files** (images, audio, video)
- **Binary documents** (PDF, PPTX, etc.)

Do NOT use Git LFS for:

- Small text files
- Source code
- Configuration files
- Documentation (except large PDFs)

## Setup Instructions

1. **Install Git LFS**:

   ```bash
   # Ubuntu/Debian
   sudo apt install git-lfs

   # macOS
   brew install git-lfs

   # Windows
   # Download from https://git-lfs.github.com/
   ```

2. **Run the setup script**:

   ```bash
   ./scripts/setup_git_lfs.sh
   ```

3. **Verify installation**:
   ```bash
   git lfs version
   ```

## Common Workflows

### Adding a New Large File

```bash
# Files with tracked extensions are automatically handled
git add path/to/large/file.h5
git commit -m "Add trained model"
git push
```

### Checking LFS Status

```bash
# See which files are LFS tracked
git lfs ls-files

# Check LFS status
git lfs status
```

### Pulling LFS Files

```bash
# Pull all LFS files
git lfs pull

# Pull specific LFS files
git lfs pull --include="path/to/file.csv"
```

### Adding a New File Type to Track

If you need to track a new file type with LFS:

1. Update the `.gitattributes` file:

   ```bash
   git lfs track "*.new-extension"
   ```

2. Commit the updated `.gitattributes`:

   ```bash
   git add .gitattributes
   git commit -m "Track *.new-extension with Git LFS"
   ```

3. Inform the team about the new tracked file type.

## Best Practices

1. **Don't modify .gitattributes without team discussion**

   - Changes affect everyone using the repository

2. **Be careful with large JSON files**

   - Consider if they should be tracked by LFS or kept as regular files
   - Configuration JSONs should NOT use LFS
   - Large data JSONs SHOULD use LFS

3. **Keep an eye on storage quotas**

   - GitHub has LFS storage and bandwidth limits
   - Be mindful when pushing very large files

4. **Use meaningful commit messages for large files**

   - Explain what the file is and why it's being added/updated

5. **Consider using data versioning tools for very large datasets**
   - For datasets >1GB, consider DVC or other specialized tools

## Troubleshooting

### Common Issues

1. **"Encountered X file(s) that should have been pointers, but weren't"**

   - Solution: `git lfs migrate import --no-rewrite path/to/file`

2. **"Git LFS is not installed"**

   - Solution: Run `git lfs install` or the setup script

3. **Slow pushes/pulls**

   - Solution: Consider using `--include` to limit which files are transferred

4. **File shows as changed but content is the same**
   - Solution: Check if LFS attributes were applied correctly

### Getting Help

If you encounter issues with Git LFS:

1. Check the [official Git LFS documentation](https://git-lfs.github.com/)
2. Ask the team in the #dev-infrastructure Slack channel
3. Create an issue in the repository with the "git-lfs" label
