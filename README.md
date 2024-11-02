# clean-up-organization-members

The Clean Up Organization Members action removes inactive members from an organization.
* It removes members who have not been active in the organization for a specified number of days.
* It takes the organization people export as input.
  * The people export is a CSV file that contains information about the members in the organization, including
  their last activity date.
  * To generate the export, go to the organization's `People` tab, click on the `Export` button (upper right),
  and select `CSV`. GitHub Docs: [Export Organization Member Info](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-membership-in-your-organization/exporting-member-information-for-your-organization).
  * The CSV file should be saved in the repository where the action will run. The path to the CSV is provided as
  an input to the action.
* It generates a CSV summary report of the inactive members and provides a workflow annoation that includes a summary of the number of members removed.
* When an organization member is not found, it will mark the member as `not_found: true` in the summary CSV and
continue without error.

<br>

:pencil: **Configuration Details**

Required input:
* `token` - Personal Access Token (PAT) or GitHub App token with the necessary permissions to remove members
from the organization. The scopes required are `admin:org`, with `read:org` and `write:org`.
* `member_list_path` - the path to the CSV file in the repo where the action runs.
* `report_path` - the path where the summary CSV should be written. **Note:** to upload the CSV as an artifact,
use GitHub's [upload-artifact](https://github.com/actions/upload-artifact) action.
* `total_days_inactive` - the number of days within which a member must have been active in the organization to
be considered active. Any member with a `last_active` date older than the date this number of days in the past
will be removed from the organization.

<br>

:file_cabinet: **Sample CSV Summary Report**
```
login,last_active,role,removed,not_found,organization
coolcool,2024-05-24 07:41:16 -0600,Owner,true,false,cool-org
wootwoot,2024-05-24 07:41:16 -0600,Member,true,false,cool-org
```

<br>

:page_facing_up: **Sample Workflow Annotation/Report Summary**
```
Total inactive members: 100.
Members removed: 99.
Members not found: 1.
```

<br>

:national_park: **Example Workflow Configuration**
```
name: Remove Inactive Members from Organization

on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 28-31 * *'

jobs:
  remove-org-members:
    runs-on: ubuntu-latest
    name: Clean Up Organization Members
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4
      - name: Clean Up Members
        uses: lmnleaf/clean-up-organization-members@v1.0.0
        with:
          token: ${{ secrets.PAT }}
          member_list_path: ${{ github.workspace }}/csv_data/org_members.csv
          report_path: ${{ github.workspace }}
          total_days_inactive: 90
      - name: Upload CSV
        uses: actions/upload-artifact@v4
        with:
          name: artifacts-usage-csv
          path: ${{ github.workspace }}/*.csv
```
