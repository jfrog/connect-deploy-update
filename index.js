const axios = require('axios');
const core = require('@actions/core');

// Function to make the API request
async function makeApiRequest(options) {
    try {
        const response = await axios(options);
        return response.data; // Return the response data
    } catch (error) {
        throw new Error(error.response ? error.response.data : error.message);
    }
}

async function deploy(project_key, groups, filters, flow_uuid, app_name, app_version, comment, parameters_mapping) {
    const requestBody = {
        device_filter: {},
        deployment_configuration: {
            flow_uuid: flow_uuid,
            comment: comment || "Default comment", // Use provided comment or fallback to default
            app: {}
        }
    };

    // API URL with project_key
    const apiUrl = `https://api.connect.jfrog.io/api/v2/${project_key}/deployments`;

    // Add groups if provided
    if (groups && groups.length > 0) {
        requestBody.device_filter.groups = groups.map(group => ({ name: group }));
    }

    // Add filters if provided
    if (filters && filters.length > 0) {
        requestBody.device_filter.filters = filters.map(filter => ({
            type: filter.type,
            operand: filter.operand,
            value: filter.value
        }));
    }

    // Add app details if provided
    if (app_name) {
        requestBody.deployment_configuration.app.name = app_name;
    }
    if (app_version) {
        requestBody.deployment_configuration.app.version = app_version;
    }

    // Add parameters mapping if provided
    if (parameters_mapping && Object.keys(parameters_mapping).length > 0) {
        requestBody.deployment_configuration.parameters_mapping = parameters_mapping;
    }

    // Remove empty properties (e.g., app if no name/version is provided)
    if (!Object.keys(requestBody.deployment_configuration.app).length) {
        delete requestBody.deployment_configuration.app;
    }
    if (!Object.keys(requestBody.device_filter).length) {
        delete requestBody.device_filter;
    }

    const options = {
        method: 'POST',
        url: apiUrl,
        headers: {
            'Content-Type': 'application/json'
        },
        data: requestBody // Use `data` for the request body in axios
    };

    try {
        const responseData = await makeApiRequest(options);
        console.log(responseData);
        core.setOutput("response", responseData); // Set output for the response if needed
    } catch (error) {
        core.setFailed(`Request failed: ${error.message}`);
    }
}

// Read inputs using @actions/core
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