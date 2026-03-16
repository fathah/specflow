# Contributing to SpecFlow

Thanks for wanting to contribute! This project is intended to be a friendly, open-source hub for building structured project intelligence that any AI coding agent can use.

## ✅ How to get started

1. **Fork the repo** and clone your fork:

   ```bash
   git clone https://github.com/fathah/specflow.git
   cd specflow
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build the project**

   ```bash
   npm run build
   ```

4. **Run linting and type-checking**

   ```bash
   npm run lint
   npx tsc --noEmit
   ```

5. **Run the CLI locally**

   ```bash
   node dist/index.js --help
   ```

## 🎯 What you can contribute

SpecFlow is architected to be extensible. Here are some areas where contributions are especially welcome:

- ✅ **Bug fixes** and **code quality improvements**
- ✅ **New domain packs** (e.g., `education_erp`, `ecommerce`, `crm`)
- ✅ **Better question/decision engines**
- ✅ **New prompt templates** or prompt exporters
- ✅ **More CLI commands** (e.g., `specflow export`, `specflow sync`, etc.)
- ✅ **Better docs and examples**

## 🧪 Writing tests

There are no tests yet, but contributions that add tests (Vitest/Jest) are highly appreciated. If you add tests, please:

- Put them under `tests/` or next to the code being tested
- Ensure they can be run via `npm test`

## 📦 Publishing

This repo is setup as an npm package.

To publish a new version:

1. Update `package.json` version.
2. Run `npm run build`.
3. Run `npm publish`.

> Note: Only maintainers should publish releases.

## 📝 Writing good PRs

A good PR should include:

- A clear description of what changed and why
- How to reproduce the problem (if fixing a bug)
- Any manual testing steps you performed
- Any follow-up work that should be done later

---

Thanks for contributing! Every improvement helps make SpecFlow more useful to developers and AI agents alike.
