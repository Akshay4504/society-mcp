import { runGetResidentServiceTests } from './GetResidentService.test.js';
import { runGetPendingPaymentsServiceTests } from './GetPendingPaymentsService.test.js';
import { runRegisterComplaintServiceTests } from './RegisterComplaintService.test.js';
import { runCreateNoticeServiceTests } from './CreateNoticeService.test.js';
import { runGenerateReportServiceTests } from './GenerateReportService.test.js';
import { runSendReminderServiceTests } from './SendReminderService.test.js';

async function runAllTests() {
  console.log("=== STARTING SMM MCP CLEAN ARCHITECTURE UNIT TESTS ===");
  try {
    await runGetResidentServiceTests();
    await runGetPendingPaymentsServiceTests();
    await runRegisterComplaintServiceTests();
    await runCreateNoticeServiceTests();
    await runGenerateReportServiceTests();
    await runSendReminderServiceTests();
    console.log("\n=== ALL UNIT TESTS PASSED SUCCESSFULLY! ===");
  } catch (err: any) {
    console.error("\n❌ UNIT TEST FAILED:", err);
    process.exit(1);
  }
}

runAllTests();
