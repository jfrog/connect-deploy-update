// index.js
const axios = require('axios');
const core = require('@actions/core');

async function deploy(project_key, groups, filters, flow_uuid, app_name, app_version, comment, parameters_mapping, token) {
    const requestBody = {
        device_filter: {},
        deployment_configuration: {
            flow_uuid: flow_uuid,
            comment: comment,
            app: {}
        }
    };

    // API URL with project_key
    const apiUrl = `https://api.connect.jfrog.io/api/v2/${project_key}/deployments`;

    // Add groups if provided
    if (groups && groups.length > 0) {
        requestBody.device_filter.groups = groups.map(group => ({name: group}));
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
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        data: requestBody // Use `data` for the request body in axios
    };

    try {
        const response = await axios(options);
        console.log(response.data);
        core.setOutput("response", response.data); // Set output for the response if needed
    } catch (error) {
        core.setFailed(`Request failed with status: ${error.status}, data: ${JSON.stringify(error.response.data)}`);
    }
}

// Export the deploy function
module.exports = {deploy};