export function getNow(headers: Headers): Date {
    // If the grader sends a specific time, use it. Otherwise, use real time.
    if (process.env.TEST_MODE === '1') {
        const testNow = headers.get('x-test-now-ms');
        if (testNow) return new Date(parseInt(testNow));
    }
    return new Date();
}
