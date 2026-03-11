import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> Navigate to http://localhost:3000
        await page.goto("http://localhost:3000", wait_until="commit", timeout=10000)
        
        # -> Fill the Product Name, Product Description, Target Users, Core Features fields with the provided content and click Generate Content Matrix to start generation.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/main/div/div[2]/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('ReelMatrix Demo Product')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/main/div/div[2]/div/div[2]/textarea').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('A lightweight tool that turns product details into a 3-tier video content plan.')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/main/div/div[2]/div/div[3]/textarea').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Startup founders, growth marketers, and indie makers.')
        
        # -> Fill Core Features with 'AI-generated content ideas, tiered strategy, color-coded cards.' and click the Generate Content Matrix button to start generation.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/main/div/div[2]/div/div[4]/textarea').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('AI-generated content ideas, tiered strategy, color-coded cards.')
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/main/div/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        # Assertions appended after the existing actions
        frame = context.pages[-1]
        
        # Verify Product Name input value
        elem = frame.locator('xpath=/html/body/main/div/div[2]/div[1]/div[1]/input')
        val = await elem.input_value()
        assert val == 'ReelMatrix Demo Product', f"Expected product name 'ReelMatrix Demo Product', got: {val}"
        
        # Verify Product Description textarea value
        elem = frame.locator('xpath=/html/body/main/div/div[2]/div[1]/div[2]/textarea')
        val = await elem.input_value()
        assert val == 'A lightweight tool that turns product details into a 3-tier video content plan.', f"Expected product description did not match. Got: {val}"
        
        # Verify Target Users textarea value
        elem = frame.locator('xpath=/html/body/main/div/div[2]/div[1]/div[3]/textarea')
        val = await elem.input_value()
        assert val == 'Startup founders, growth marketers, and indie makers.', f"Expected target users did not match. Got: {val}"
        
        # Verify Core Features textarea value
        elem = frame.locator('xpath=/html/body/main/div/div[2]/div[1]/div[4]/textarea')
        val = await elem.input_value()
        assert val == 'AI-generated content ideas, tiered strategy, color-coded cards.', f"Expected core features did not match. Got: {val}"
        
        # Verify Generate Content Matrix button is visible
        btn = frame.locator('xpath=/html/body/main/div/div[2]/div[1]/button')
        assert await btn.is_visible(), "Generate Content Matrix button is not visible"
        
        # The test plan requires verifying a loading skeleton and the texts 'Tier 1', 'Tier 2', 'Tier 3'.
        # Those specific elements/xpaths are not present in the provided available elements list, so we cannot perform those assertions here.
        raise AssertionError("Missing elements for verification: 'loading skeleton', 'Tier 1', 'Tier 2', 'Tier 3' — their xpaths are not available on the page. Cannot complete those assertions.")
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    