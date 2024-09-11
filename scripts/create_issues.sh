#!/bin/bash

# Check for yq
if ! command -v yq &> /dev/null; then
    echo "yq not found, installing..."
    brew install yq
fi

# Check for gh and authentication
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) not found. Please install it using 'brew install gh' and authenticate with 'gh auth login'."
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo "You're not authenticated with GitHub CLI. Please run 'gh auth login' first."
    exit 1
fi

# Path to the YAML file
yaml_file="issues.yaml"

# Check if the YAML file exists
if [ ! -f "$yaml_file" ]; then
    echo "Error: $yaml_file not found."
    exit 1
fi

# Get the current repository
repo=$(gh repo view --json nameWithOwner -q .nameWithOwner)
if [ -z "$repo" ]; then
    echo "Error: Unable to determine the current repository. Make sure you're in a git repository connected to GitHub."
    exit 1
fi

echo "Processing issues in repository: $repo"

# Create labels
echo "Creating labels..."
labels=$(yq e '.issues[].labels[]' $yaml_file | sort -u)
for label in $labels; do
    if ! gh label list --repo "$repo" | grep -q "^$label[[:space:]]"; then
        if gh label create "$label" --repo "$repo"; then
            echo "Created label: $label"
        else
            echo "Failed to create label: $label"
        fi
    else
        echo "Label already exists: $label"
    fi
done

# Get existing issues
existing_issues=$(gh issue list --repo "$repo" --json number,title --jq '.[]')

# Loop through each issue in the YAML file
for row in $(yq e '.issues | keys | .[]' $yaml_file); do
  title=$(yq e ".issues[$row].title" $yaml_file)
  body=$(yq e ".issues[$row].body" $yaml_file)
  labels=$(yq e ".issues[$row].labels[]" $yaml_file)
  assignees=$(yq e ".issues[$row].assignees[]" $yaml_file)
  
  echo "Processing issue: $title"
  
  # Check if the issue already exists
  existing_issue=$(echo "$existing_issues" | jq -r "select(.title == \"$title\")")
  if [ ! -z "$existing_issue" ]; then
    echo "Issue already exists: $title"
    issue_number=$(echo "$existing_issue" | jq -r '.number')
    
    # Update the existing issue
    label_args=""
    for label in $labels; do
      label_args="$label_args --add-label \"$label\""
    done
    
    assignee_args=""
    for assignee in $assignees; do
      assignee_args="$assignee_args --add-assignee $assignee"
    done
    
    if output=$(gh issue edit $issue_number --repo "$repo" --title "$title" --body "$body" $label_args $assignee_args 2>&1); then
      echo "Successfully updated issue: $title"
    else
      echo "Error updating issue: $title"
      echo "Error message: $output"
    fi
  else
    # Create the issue in GitHub
    label_args=""
    for label in $labels; do
      label_args="$label_args --label \"$label\""
    done
    
    assignee_args=""
    for assignee in $assignees; do
      assignee_args="$assignee_args --assignee $assignee"
    done
    
    if output=$(gh issue create --repo "$repo" --title "$title" --body "$body" $label_args $assignee_args 2>&1); then
      echo "Successfully created issue: $title"
      echo "Issue URL: $output"
    else
      echo "Error creating issue: $title"
      echo "Error message: $output"
    fi
  fi
done

# Delete issues that are not in the YAML file
echo "Checking for issues to delete..."
for issue in $(echo "$existing_issues" | jq -c '.'); do
  existing_title=$(echo $issue | jq -r '.title')
  if ! yq e '.issues[].title' $yaml_file | grep -q "$existing_title"; then
    echo "Deleting issue: $existing_title"
    issue_number=$(echo $issue | jq -r '.number')
    if gh issue close $issue_number --repo "$repo" --comment "Closing issue as it's no longer needed."; then
      echo "Successfully closed issue: $existing_title"
    else
      echo "Error closing issue: $existing_title"
    fi
  fi
done

echo "All issues processing completed!"