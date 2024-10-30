import * as fs from 'fs/promises';

function createReport(removedMembers, reportPath) {
  const csvRows = removedMembers.map((member) => [
    member.login,
    member.lastActive,
    member.role,
    member.removed,
    member.notFound,
    member.organization
  ]);

  csvRows.unshift([
    'login',
    'last_active',
    'role',
    'removed',
    'not_found',
    'organization'
  ]);

  writeReport(csvRows, reportPath);

  return reportSummary(removedMembers);
}

function writeReport(csvRows, path) {
  removedMembersReport.writeFile(path + '/removed-organization-members.csv', csvRows.join('\r\n'), (error) => {
    console.log(error || 'Report created successfully.');
  })
}

function writeFile(path, data, callback) {
  fs.writeFile(path, data, callback);
}

function reportSummary(removedMembers) {
  let reportSummary = 'Total inactive members: ' + removedMembers.length.toString() + '.\n' +
    'Members removed: ' + removedMembers.filter((member) => member.removed).length.toString() + '.\n' +
    'Members not found: ' + removedMembers.filter((member) => member.notFound).length.toString() + '.'

  return reportSummary;
}

export const removedMembersReport = {
  writeFile,
  createReport
}
