package com.lingoung.bank;

import android.nfc.cardemulation.HostApduService;
import android.os.Bundle;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

public class LingoungHostApduService extends HostApduService {
    private static final byte[] SELECT_AID = hex("00A4040007F001020304050600");
    private static final byte[] GET_TOKEN = hex("80CA000000");
    private static final byte[] OK = hex("9000");
    private static final byte[] NOT_FOUND = hex("6A82");
    private static final byte[] UNKNOWN = hex("6D00");

    @Override
    public byte[] processCommandApdu(byte[] commandApdu, Bundle extras) {
        if (Arrays.equals(commandApdu, SELECT_AID)) return OK;
        if (Arrays.equals(commandApdu, GET_TOKEN)) {
            String token = getSharedPreferences("lingoung_nfc", MODE_PRIVATE).getString("payment_token", "");
            if (token.isEmpty()) return NOT_FOUND;
            byte[] payload = token.getBytes(StandardCharsets.UTF_8);
            byte[] response = Arrays.copyOf(payload, payload.length + OK.length);
            System.arraycopy(OK, 0, response, payload.length, OK.length);
            return response;
        }
        return UNKNOWN;
    }

    @Override
    public void onDeactivated(int reason) {
        // The short-lived server token remains available until its 90-second expiry.
    }

    private static byte[] hex(String value) {
        int length = value.length();
        byte[] bytes = new byte[length / 2];
        for (int i = 0; i < length; i += 2) {
            bytes[i / 2] = (byte) ((Character.digit(value.charAt(i), 16) << 4)
                + Character.digit(value.charAt(i + 1), 16));
        }
        return bytes;
    }
}