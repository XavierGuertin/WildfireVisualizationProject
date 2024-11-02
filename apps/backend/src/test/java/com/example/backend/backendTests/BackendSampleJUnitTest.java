package com.example.backend.backendTests;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import com.example.backend.backend.BackendSampleForTesting;

public class BackendSampleJUnitTest {

    @Test
    void createNewBackendForTesting() {
        var test = new BackendSampleForTesting("TEST", true);

        Assertions.assertEquals("TEST", test.name(), "Name was not equal to TEST");

    }

}
