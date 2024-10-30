import { memberList } from './member-list.js';

async function removeMembers(listPath, owner, totalDays, octokit) {
  try {
    let inactiveMembers = await memberList.prepareInactiveList(listPath, owner, totalDays);

    for (let member of inactiveMembers) {
      try {
        await octokit.rest.orgs.removeMembershipForUser({
          org: owner,
          username: member['login']
        });

        member['removed'] = true;
      } catch (error) {
        member['removed'] = false;

        if (error.status === 404 && error.message.includes('Cannot find ' + member['login'])) {
          member['notFound'] = true;
          continue;
        } else {
          throw error;
        }
      }
    }

    return inactiveMembers;
  } catch (error) {
    throw error;
  }
}

export const removeMembersFromOrg = {
  removeMembers: removeMembers
}
