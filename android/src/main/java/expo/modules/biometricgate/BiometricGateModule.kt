package expo.modules.biometricgate

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class BiometricGateModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("BiometricGate")

    Function("getNativeVersion") {
      "0.1.0"
    }
  }
}
