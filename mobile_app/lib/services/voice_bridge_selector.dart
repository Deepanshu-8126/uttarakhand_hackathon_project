import 'voice_bridge_interface.dart';
import 'voice_bridge_stub.dart'
    if (dart.library.html) 'voice_bridge_web.dart';

VoicePlatformBridge getPlatformVoiceBridge() => getVoicePlatformBridge();
