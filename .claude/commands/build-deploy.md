Build the Vite application and deploy it to the deploy/ repository with a detailed commit message.

Steps:
1. Get the last deployment reference:
   - Check deploy/.last-deploy file for the last slurm-spa commit hash
   - If file doesn't exist, use the first commit in slurm-spa history

2. Generate a summary of changes:
   - Get all commit messages from slurm-spa between the last deploy commit and HEAD
   - Format them as a bulleted list, excluding any commits that only modified .claude/ or documentation files

3. Run `npm run build` to compile the application (outputs to deploy/)

4. Navigate to the deploy/ directory

5. Stage all changes with `git add -A`

6. Create a commit message in this format:
   ```
   Deploy: YYYY-MM-DD HH:MM:SS

   Changes since last deploy:
   - [commit message 1]
   - [commit message 2]
   - [commit message 3]
   ```

7. Save the current slurm-spa HEAD commit hash to deploy/.last-deploy for next time

Note: You will need to push the changes manually from the deploy/ directory

Execute these steps sequentially and report the results.
