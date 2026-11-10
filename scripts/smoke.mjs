const endpoint = process.env.GRAPHQL_URL ?? 'http://localhost:3000/graphql';
const query = `query Card { profile {
  id name description githubUrl portfolioUrl
  skills { name category }
  experience { company position period achievements }
  projects { name description url }
} }`;

const response = await fetch(endpoint, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ query }),
});
if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
const result = await response.json();
if (result.errors?.length) throw new Error(JSON.stringify(result.errors));
const p = result.data?.profile;
if (!p?.name || !p.skills?.length || !p.experience?.length || !p.projects?.length) {
  throw new Error('Profile or nested relations are missing: ' + JSON.stringify(result));
}
console.log(`PASS ${p.name}: ${p.skills.length} skills, ${p.experience.length} experience, ${p.projects.length} projects`);
