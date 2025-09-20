def test_app_import():
    import importlib
    app = importlib.import_module('app.main')
    assert hasattr(app, 'app')
