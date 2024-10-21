const nock = require('nock');
const core = require('@actions/core');
const {deploy} = require('./deploy.js'); // Adjust the path as necessary

jest.mock('@actions/core');

describe('deploy function', () => {
    const project_key = 'test_project';
    const groups = ['Production'];
    const filters = [{type: 'specific_device', operand: 'is', value: 'd-ebcd-9114'}];
    const flow_uuid = 'f-2af7-c943';
    const app_name = 'default_app';
    const app_version = 'v1.1';
    const comment = 'test webhook 1';
    const parameters_mapping = {username: 'ubuntu', conf_path: '/etc/app/settings.conf'};
    const token = 'test_token';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully deploy and set the output', async () => {
        const mockResponse = {'deployment_uuid': 109209};
        let requestBody;

        nock('https://api.connect.jfrog.io', {
            reqheaders: {
                'Authorization': `Bearer ${token}`
            }
        })
            .post(`/api/v2/${project_key}/deployments`, body => {
                requestBody = body;
                return true;
            })
            .reply(200, mockResponse);

        await deploy(project_key, groups, filters, flow_uuid, app_name, app_version, comment, parameters_mapping, token);

        expect(core.setOutput).toHaveBeenCalledWith('response', mockResponse);
        expect(core.setFailed).not.toHaveBeenCalled();

        // Assert the request payload
        expect(requestBody).toEqual({
            device_filter: {
                groups: [{name: 'Production'}],
                filters: [{type: 'specific_device', operand: 'is', value: 'd-ebcd-9114'}]
            },
            deployment_configuration: {
                flow_uuid: 'f-2af7-c943',
                comment: 'test webhook 1',
                app: {name: 'default_app', version: 'v1.1'},
                parameters_mapping: {username: 'ubuntu', conf_path: '/etc/app/settings.conf'}
            }
        });
    });

    it('should fail to deploy and set the failure message', async () => {
        const mockError = {message: 'Request failed'};

        nock('https://api.connect.jfrog.io', {
            reqheaders: {
                'Authorization': `Bearer ${token}`
            }
        })
            .post(`/api/v2/${project_key}/deployments`)
            .reply(400, mockError);

        await deploy(project_key, groups, filters, flow_uuid, app_name, app_version, comment, parameters_mapping, token);

        expect(core.setFailed).toHaveBeenCalledWith(`Request failed with status: 400, data: ${JSON.stringify(mockError)}`);
        expect(core.setOutput).not.toHaveBeenCalled();
    });
});