import { default as removeMembersFromOrg } from '../src/remove-members-from-org.js';
import { memberList } from '../src/member-list.js';
import Moctokit from './support/moctokit.js';

describe('Member List', function() {
  let octokit;
  let prepareInactiveListOriginal;
  let inactiveMembers = [
    {
      login: 'inactivewoot',
      lastActive: '2024-05-24 07:41:16 -0600',
      role: 'Owner'
    },
    { login: 'inactivecool', lastActive: 'No activity', role: 'Member' },
    {
      login: 'inactivedance',
      lastActive: '2024-9-24 11:54:00 -0600',
      role: 'Owner'
    }
  ]
  let path = './spec/support/test_data.csv';
  let owner = 'test-org';
  let totalDays = 90;

  beforeEach(() => {
    octokit = new Moctokit();

    prepareInactiveListOriginal = memberList.prepareInactiveList;
    memberList.prepareInactiveList = jasmine.createSpy('prepareInactiveList').and.returnValue(Promise.resolve(inactiveMembers));
  });

  afterEach(function () {
    memberList.prepareInactiveList = prepareInactiveListOriginal;
  });

  it ('returns a list of members removed from the org', async function() {
    let removedMembers = await removeMembersFromOrg(path, owner, totalDays, octokit);

    expect(removedMembers.length).toBe(3);
    expect(removedMembers[0]['login']).toBe('inactivewoot');
    expect(removedMembers[0]['lastActive']).toBe('2024-05-24 07:41:16 -0600');
    expect(removedMembers[0]['role']).toBe('Owner');
    expect(removedMembers[0]['removed']).toBe(true);
    expect(removedMembers[1]['login']).toBe('inactivecool');
    expect(removedMembers[1]['lastActive']).toBe('No activity');
    expect(removedMembers[1]['role']).toBe('Member');
    expect(removedMembers[1]['removed']).toBe(true);
    expect(removedMembers[2]['login']).toBe('inactivedance');
    expect(removedMembers[2]['lastActive']).toBe('2024-9-24 11:54:00 -0600');
    expect(removedMembers[2]['role']).toBe('Owner');
    expect(removedMembers[2]['removed']).toBe(true);
  });

  it ('continues to next inactive member if member not found', async function() {
    spyOn(octokit.rest.orgs, 'removeMembershipForUser').and.callFake((options) => {
      if (options.username === 'inactivecool') {
        throw new Error('member not found');
      }
    });

    let removedMembers = await removeMembersFromOrg(path, owner, totalDays, octokit);

    expect(removedMembers.length).toBe(3);
    expect(removedMembers[0]['login']).toBe('inactivewoot');
    expect(removedMembers[0]['removed']).toBe(true);
    expect(removedMembers[1]['login']).toBe('inactivecool');
    expect(removedMembers[1]['removed']).toBe(false);
    expect(removedMembers[2]['login']).toBe('inactivedance');
    expect(removedMembers[2]['removed']).toBe(true);
  });

  it('handles errors', async function() {
    memberList.prepareInactiveList = jasmine.createSpy('prepareInactiveList')
      .and.returnValue(Promise.reject(new Error('uh oh')));
    let caughtError;
 
    try {
      await removeMembersFromOrg(path, owner, totalDays, octokit);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError.message).toBe('uh oh');
  });
});
