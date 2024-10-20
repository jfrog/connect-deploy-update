const request = require('request');

function deploy(project_key, groups, filters, flow_uuid, app_name, app_version, comment) {
    const requestBody = {
        device_filter: {},
        deployment_configuration: {
            flow_uuid: flow_uuid,
            comment: comment || "Default comment",  // Use provided comment or fallback to default
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
        body: JSON.stringify(requestBody)
    };

    request(options, function (error, response) {
        if (error) {
            throw new Error(error);
        }
        console.log(response.body);
    });
}

// Use the function with provided arguments from environment variables or GitHub actions inputs
const project_key = process.argv[2];
const groups = process.argv[3] ? JSON.parse(process.argv[3]) : [];  // Optional, defaults to empty array
const filters = process.argv[4] ? JSON.parse(process.argv[4]) : []; // Optional, defaults to empty array
const flow_uuid = process.argv[5]; // Required
const app_name = process.argv[6] || null;  // Optional, defaults to null
const app_version = process.argv[7] || null;  // Optional, defaults to null
const comment = process.argv[8] || null;  // Optional, defaults to null

if (!project_key || !flow_uuid) {
    console.error("Error: 'project_key' and 'flow_uuid' are mandatory.");
    process.exit(1);
}

deploy(project_key, groups, filters, flow_uuid, app_name, app_version, comment);

