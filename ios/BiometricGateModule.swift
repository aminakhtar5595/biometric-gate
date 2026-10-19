import ExpoModulesCore

public class BiometricGateModule: Module {
  public func definition() -> ModuleDefinition {
    Name("BiometricGate")

    Function("getNativeVersion") { () -> String in
      "0.1.0"
    }
  }
}
