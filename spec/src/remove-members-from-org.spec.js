import { removeMembersFromOrg } from '../../src/remove-members-from-org.js';
import { memberList } from '../../src/member-list.js';
import Moctokit from '../support/moctokit.js';

describe('Member List', function() {
  let octokit;
  let prepareInactiveListOriginal;
  let inactiveMembers = [
    {
      login: 'inactivewoot',
      lastActive: '2024-05-24 07:41:16 -0600',
      role: 'Owner',
      removed: false,
      notFound: false
    },
    { login: 'inactivecool',
      lastActive: 'No activity',
      role: 'Member',
      removed: false,
      notFound: false
    },
    {
      login: 'inactivedance',
      lastActive: '2024-9-24 11:54:00 -0600',
      role: 'Owner',
      removed: false,
      notFound: false
    }
  ]
  let path = './spec/support/test_data.csv';
  let owner = 'test-org';
  let totalDays = 90;

  beforeEach(function() {
    octokit = new Moctokit();

    prepareInactiveListOriginal = memberList.prepareInactiveList;
    memberList.prepareInactiveList = jasmine.createSpy('prepareInactiveList').and.returnValue(Promise.resolve(inactiveMembers));
  });

  afterEach(function () {
    memberList.prepareInactiveList = prepareInactiveListOriginal;
  });

  it ('returns a list of members removed from the org', async function() {
    let removedMembers = await removeMembersFromOrg.removeMembers(path, owner, totalDays, octokit);

    expect(memberList.prepareInactiveList).toHaveBeenCalledWith(path, owner, totalDays);

    expect(removedMembers.length).toBe(3);
    expect(removedMembers[0]['login']).toBe('inactivewoot');
    expect(removedMembers[0]['lastActive']).toBe('2024-05-24 07:41:16 -0600');
    expect(removedMembers[0]['role']).toBe('Owner');
    expect(removedMembers[0]['removed']).toBe(true);
    expect(removedMembers[0]['notFound']).toBe(false);
    expect(removedMembers[1]['login']).toBe('inactivecool');
    expect(removedMembers[1]['lastActive']).toBe('No activity');
    expect(removedMembers[1]['role']).toBe('Member');
    expect(removedMembers[1]['removed']).toBe(true);
    expect(removedMembers[0]['notFound']).toBe(false);
    expect(removedMembers[2]['login']).toBe('inactivedance');
    expect(removedMembers[2]['lastActive']).toBe('2024-9-24 11:54:00 -0600');
    expect(removedMembers[2]['role']).toBe('Owner');
    expect(removedMembers[2]['removed']).toBe(true);
    expect(removedMembers[0]['notFound']).toBe(false);
  });

  it ('continues to next inactive member if member not found', async function() {
    spyOn(octokit.rest.orgs, 'removeMembershipForUser').and.callFake((options) => {
      if (options.username === 'inactivecool') {
        let notFoundError = new Error('Cannot find inactivecool');
        notFoundError.status = 404;
        throw notFoundError;
      } else {
        return Promise.resolve({ status: 204 });
      }
    });

    let removedMembers = await removeMembersFromOrg.removeMembers(path, owner, totalDays, octokit);

    expect(removedMembers.length).toBe(3);
    expect(removedMembers[0]['login']).toBe('inactivewoot');
    expect(removedMembers[0]['removed']).toBe(true);
    expect(removedMembers[0]['notFound']).toBe(false);
    expect(removedMembers[1]['login']).toBe('inactivecool');
    expect(removedMembers[1]['removed']).toBe(false);
    expect(removedMembers[1]['notFound']).toBe(true);
    expect(removedMembers[2]['login']).toBe('inactivedance');
    expect(removedMembers[2]['removed']).toBe(true);
    expect(removedMembers[2]['notFound']).toBe(false);
  });

  it('handles errors', async function() {
    memberList.prepareInactiveList = jasmine.createSpy('prepareInactiveList')
      .and.returnValue(Promise.reject(new Error('uh oh')));
    let caughtError;
 
    try {
      await removeMembersFromOrg.removeMembers(path, owner, totalDays, octokit);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError.message).toBe('uh oh');
  });
});
