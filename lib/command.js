module.exports = class Command {
  constructor(app, service, cmd, dockerRunner) {
    this._app = app;
    this._cmd = cmd;
    this._service = service;
    this._dockerRunner = dockerRunner;
  }

  get app() {
    return this._app;
  }

  get cmd() {
    return this._cmd;
  }

  get service() {
    return this._service;
  }

  get dockerRunner() {
    return this._dockerRunner;
  }
};
