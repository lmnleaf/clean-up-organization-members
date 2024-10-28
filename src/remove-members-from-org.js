import { memberList } from './member-list.js';

async function removeMembersFromOrg(listPath, owner, totalDays, octokit) {
  try {
    let inactiveMembers = await memberList.prepareInactiveList(listPath, totalDays);

    inactiveMembers.forEach(async (member) => {
      try {
        await octokit.rest.orgs.removeMembershipForUser({
          org: owner,
          username: member['login']
        });

        member['removed'] = true;
      } catch (error) {
        member['removed'] = false;

        if (error.message.includes('member not found')) {
          member['notFound'] = true;
          return;
        } else {
          throw error;
        }
      }
    });

    return inactiveMembers;
  } catch (error) {
    throw error;
  }
}

export default removeMembersFromOrg;
