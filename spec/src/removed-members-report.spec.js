import { removedMembersReport } from '../../src/removed-members-report.js';

describe("Removed Members Report", function() {
  let owner = 'cool-org';
  let path = '/home/runner/work/this-repo/this-repo';
  let removedMembers = [
    {
      login: 'inactivewoot',
      lastActive: '2024-05-24 07:41:16 -0600',
      role: 'Owner',
      removed: true,
      notFound: false,
      organization: 'cool-org'
    },
    { login: 'inactivecool',
      lastActive: 'No activity',
      role: 'Member',
      removed: false,
      notFound: true,
      organization: 'cool-org' },
    {
      login: 'inactivedance',
      lastActive: '2024-9-24 11:54:00 -0600',
      role: 'Member',
      removed: true,
      notFound: false,
      organization: 'cool-org'
    }
  ]

  beforeEach(() => {
    removedMembersReport.writeFile = jasmine.createSpy('writeFile').and.callFake((path, data, callback) => {
      callback(null); // Simulate successful write operation
    });
  });

  it ('creates a CSV of artifacts', async function() {
    removedMembersReport.createReport(removedMembers, path);

    const args = removedMembersReport.writeFile.calls.mostRecent().args;
    const filePath = args[0];
    const fileContent = args[1];

    expect(filePath).toContain('/home/runner/work/this-repo/this-repo/removed-organization-members.csv');

    const lines = fileContent.split('\n');

    expect(lines.length).toBe(4);
    expect(lines[0]).toContain('login,last_active,role,removed,not_found,organization');
    expect(lines[1]).toContain('inactivewoot,2024-05-24 07:41:16 -0600,Owner,true,false,cool-org');
    expect(lines[2]).toContain('inactivecool,No activity,Member,false,true,cool-org');
    expect(lines[3]).toContain('inactivedance,2024-9-24 11:54:00 -0600,Member,true,false,cool-org');
  });

  it ('returns a report summary when the report covers a list of repos', async function() {
    const reportSummary = removedMembersReport.createReport(removedMembers, path);

    expect(reportSummary).toEqual(
      'Total inactive members: 3.\n' +
      'Members removed: 2.\n' +
      'Members not found: 1.'
    );
  });

  it('handles errors', async function() {
    let caughtError;
    removedMembersReport.writeFile = jasmine.createSpy('writeFile').and.throwError(new Error('uh oh'));

    try {
      removedMembersReport.createReport(removedMembers, path);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError.message).toEqual('uh oh');
  });
});
