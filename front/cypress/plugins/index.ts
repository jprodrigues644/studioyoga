/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
export default (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  // Ajouter le plugin de code coverage
  require('@cypress/code-coverage/task')(on, config);
  
  // IMPORTANT: retourner la config
  return config;
};