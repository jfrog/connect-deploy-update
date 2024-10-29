# Deploy Device Update Action

[![ci](https://github.com/upswift/connect-deploy-update/actions/workflows/ci.yml/badge.svg)](https://github.com/upswift/connect-deploy-update/actions/workflows/ci.yml)

This GitHub Action enables you to deploy an update flow configured in JFrog Connect’s web UI to specific devices or
groups of devices within your fleet. You can specify device filters and update configurations, and provide deployment
comments.

## Usage

### Example Invocation

#### Minimal

```yaml
      - uses: jfrog/connect-deploy-update@v1
        with:
          project_key: production
          groups: '["all"]'
          flow_uuid: d-feaf-d9aa
          token: ${{ secrets.CONNECT_API_TOKEN }}
```

#### Full

```yaml
      - name: Deploy Update
        uses: jfrog/connect-deploy-update@v1
        with:
          project_key: production
          groups: '["all"]'
          filters: >
            [
              {
                "type": "tag",
                "operand": "is",
                "value": "stable"
              },
              {
                "type": "device_state",
                "operand": "is",
                "value": "online"
              }
            ]
          flow_uuid: d-feaf-d9aa
          app_name: my_app
          app_version: 1.0.0
          comment: 'deployed using GitHub Actions!'
          parameters_mapping: >
            {
              "update_param_name1": "value",
              "update_param_name2": "value"
            }
          token: ${{ secrets.CONNECT_API_TOKEN }}
```

### Inputs

* project_key (required): The project key where the deployment will be executed.
* groups (optional): The device group names in JSON format to filter by. Example: ["Production", "QA"].
* filters (optional): The filters in JSON format to define device-specific criteria. Each filter includes type, operand,
  and value. See device_filter below for details.
* flow_uuid (required): The update flow UUID that specifies which flow to use. You can obtain the UUID from the “Update
  Flows” tab in the JFrog Connect web UI.
* app_name (optional): The name of the application to be deployed (must exist in the Connect web UI).
* app_version (optional): The version of the application to deploy.
* comment (optional): A brief comment to describe the purpose or details of the deployment. Default is Default comment.
* parameters_mapping (optional): The mapping of parameters for the update configuration in JSON format. Example: {"
  update_param_name1": "value", "update_param_name2": "value"}.
* token (required): The authorization token for authentication.

### API Request Structure

#### device_filter

The device_filter object defines which devices will be acted on based on the following parameters described below.

#### groups

* Type: Array of strings
* Description: One or multiple groups to include in the filter.
* Example: ["Production", "QA"]

#### filters

The filters array defines the criteria for the devices to be included in the deployment. You can use multiple filters
with an AND relationship. Each filter has a type, operand, and value:

* Type: Array of objects
* Description: Criteria for filtering devices.
* Example:

```json
[
  {
    "type": "specific_device",
    "operand": "is",
    "value": "d-ebcd-9114"
  },
  {
    "type": "tag",
    "operand": "is",
    "value": "stable"
  }
]
```

#### Filter Types

* **specific_device**: Filters by the specific device’s UUID. The UUID can be obtained from the Devices page in the
  Connect web UI.
    * Operands: is, is_not
    * Value: Device UUID string.

* **tag**: Filters by device tag.
    * Operands: is, is_not
    * Value: Name of the tag.


* **app**: Filters by the application assigned to the device.
    * Operands: is, is_not
    * Value: Application name.
    * Optionally adding **app_version** to the filter will filter by the application version.
        * Operands: is, is_not
        * Value: Application version.


* **device_state**: Filters by the current state of the device.
    * Operand: is
    * Possible Values: online, offline


* **deployment**: Filters by the deployment status of the device.
    * Operand: is
    * Possible Values: pending, in_progress, success, failed, aborted, any
    * Additional Property: Requires the deployment_id from the Deployments tab of the Updates page in the Connect web
      UI.

#### deployment_configuration

The deployment_configuration object specifies the parameters for the deployment:

* flow_uuid: (Required) Specifies which update flow to use. You can obtain the UUID from the “Update Flows” tab in the
  Connect web UI.
* comment: (Optional) You can add a brief comment to describe the purpose or importance of the deployment.
* app: (Optional) Defines the application to deploy. This includes the name of the app and its version (e.g., "name": "
  default_app", "version": "v1.1").
* parameters_mapping: (Optional) Specifies the update parameters configured in the update flow. Example: {"
  update_param_name1": "value", "update_param_name2": "value"}.

#### Notes

* This action is designed to trigger device updates via the JFrog Connect API.
* Ensure that you have the correct flow_uuid, project_key, and any necessary filters or app configurations before
  running this action.
* Filters can be left empty, but their structure must be defined.

# Contributing

### prerequisites

- Node.js v20

### Setup

- Clone the repository
- Run `npm install`

### Testing

- Run `npm test`

### Packaging

- Make code changes
- Pack using `npm run pack`
- Commit the changes (including the packed file `bin/run.js`)

### Release

- Tag the commit with the version number
