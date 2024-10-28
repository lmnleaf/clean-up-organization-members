import { memberList } from '../src/member-list.js';

describe('Member List', function() {
  let date = new Date(2024, 9, 27);
  // Reminder: JavaScript's Date object uses 0-indexed months, so 9 is October
  let baseTime = new Date(date.setUTCHours(17, 0, 0, 0));
  let path = './spec/support/test_data.csv';
  let owner = 'cool-org';
  let totalDays = 90;

  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(baseTime));
  });

  afterEach(function () {
    jasmine.clock().uninstall();
  });

  it ('returns a list of inactive members', async function() {
    let inactiveMembers = await memberList.prepareInactiveList(path, owner, totalDays);

    expect(inactiveMembers.length).toBe(2);
    expect(inactiveMembers[0]['login']).toBe('wootwoot');
    expect(inactiveMembers[0]['lastActive']).toBe('2024-05-24 07:41:16 -0600');
    expect(inactiveMembers[0]['role']).toBe('Owner');
    expect(inactiveMembers[0]['organization']).toBe('cool-org');
    expect(inactiveMembers[0]['removed']).toBe(false);
    expect(inactiveMembers[0]['notFound']).toBe(false);
    expect(inactiveMembers[1]['login']).toBe('yipyip');
    expect(inactiveMembers[1]['lastActive']).toBe('No activity');
    expect(inactiveMembers[1]['role']).toBe('Member');
    expect(inactiveMembers[1]['organization']).toBe('cool-org');
    expect(inactiveMembers[0]['removed']).toBe(false);
    expect(inactiveMembers[0]['notFound']).toBe(false);
  });

  it ('returns a list of inactive members based on totalDays', async function() {
    let inactiveMembers = await memberList.prepareInactiveList(path, owner, 30);

    expect(inactiveMembers.length).toBe(3);
    expect(inactiveMembers[0]['login']).toBe('wootwoot');
    expect(inactiveMembers[0]['lastActive']).toBe('2024-05-24 07:41:16 -0600');
    expect(inactiveMembers[1]['login']).toBe('yipyip');
    expect(inactiveMembers[1]['lastActive']).toBe('No activity');
    expect(inactiveMembers[2]['login']).toBe('dancedance');
    expect(inactiveMembers[2]['lastActive']).toBe('2024-9-24 11:54:00 -0600');
  });

  it('handles file not found errors', async function() {
    let path = './spec/support/missing.csv';
    let caughtError;

    try {
      await memberList.prepareInactiveList(path, owner, totalDays);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toEqual(new Error('Member list not found.'));
  });
});
