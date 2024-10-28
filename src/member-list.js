import * as fs from 'fs/promises';

async function prepareInactiveList(listPath, owner, totalDays) {
  let dateToday = new Date();
  let startDate = new Date(dateToday);
  startDate.setUTCDate(dateToday.getUTCDate() - totalDays);
  startDate = startDate.setUTCHours(0, 0, 0, 0);

  try {
    let lines = await fs.readFile(listPath, 'utf8');

    lines = lines.split('\n');

    let headers = lines[0].split(',');

    lines.shift();

    let memberData = [];

    lines.forEach((line) => {
      let memberInfo = {};
      const currentLine = line.split(',');

      for (let i = 0; i < headers.length; i++) {
        memberInfo[toCamelCase(headers[i])] = currentLine[i];
      }

      if (memberIsInactive(memberInfo, startDate)) {
        let inactiveMemberInfo = {};

        inactiveMemberInfo['login'] = memberInfo['login'];
        inactiveMemberInfo['lastActive'] = memberInfo['lastActive'];
        inactiveMemberInfo['role'] = memberInfo['role'];
        inactiveMemberInfo['organization'] = owner;

        memberData.push(inactiveMemberInfo);
      }
    });

    return memberData;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('Member list not found.');
    } else {
      throw error;
    }
  }
}

function toCamelCase(str) {
  return str.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
}

function memberIsInactive(member, startDate) {
  let lastActiveDate = new Date(member['lastActive']);
  let memberExists = member['login'] != '' && member['login'] != null;
  let memberHasNoActivity = member['lastActive'] === 'No activity' || member['lastActive'] === null;
  let memberIsInactive = lastActiveDate < startDate;

  return memberExists && (memberHasNoActivity || memberIsInactive);
}

export const memberList = {
  prepareInactiveList: prepareInactiveList
}
