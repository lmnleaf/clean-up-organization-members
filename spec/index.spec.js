import main from '../index.js';
import { removeMembersFromOrg } from '../src/remove-members-from-org.js';
import { removedMembersReport } from '../src/removed-members-report.js';

describe('main', function() {
  let removeMembersOriginal = removeMembersFromOrg.removeMembers;
  let createReportOriginal = removedMembersReport.createReport;

  beforeEach(() => {
    removeMembersFromOrg.removeMembers = jasmine.createSpy('removeMembers').and
      .returnValue(Promise.resolve([{ login: 'inactivewoot' }]));
    removedMembersReport.createReport = jasmine.createSpy('createReport').and.returnValue('cool');
  });

  afterEach(function () {
    removeMembersFromOrg.removeMembers = removeMembersOriginal;
    removedMembersReport.createReport = createReportOriginal;
  });

  it('removes inactive members and creates a report', async function() {
    const result = await main();

    expect(removeMembersFromOrg.removeMembers).toHaveBeenCalled();
    expect(removedMembersReport.createReport).toHaveBeenCalled();
  });
});
