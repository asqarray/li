/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import DemonConsole from './components/AuditDashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 selection:bg-cyan-500/30 selection:text-white">
      <DemonConsole />
    </div>
  );
}
