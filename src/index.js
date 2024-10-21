const {deploy} = require("./deploy");
const core = require('@actions/core');


(async () => {
    try {
        const project_key = core.getInput('project_key', { required: true });
        const groups = JSON.parse(core.getInput('groups') || '[]'); // Optional, defaults to empty array
        const filters = JSON.parse(core.getInput('filters') || '[]'); // Optional, defaults to empty array
        const flow_uuid = core.getInput('flow_uuid', { required: true }); // Required
        const app_name = core.getInput('app_name') || null; // Optional, defaults to null
        const app_version = core.getInput('app_version') || null; // Optional, defaults to null
        const comment = core.getInput('comment') || null; // Optional, defaults to null
        const parameters_mapping = JSON.parse(core.getInput('parameters_mapping') || '{}'); // Optional, defaults to empty object

        // Await the deployment call
        await deploy(project_key, groups, filters, flow_uuid, app_name, app_version, comment, parameters_mapping);
    } catch (error) {
        core.setFailed(error.message);
    }
})();