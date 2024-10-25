class Moctokit {
  constructor() {
    this.rest = {
      orgs: {
        removeMembershipForUser: this.removeMember.bind(this)
      }
    };
  }

  removeMember() {
    return Promise.resolve({ status: 204 });
  }
}
  
export default Moctokit;
