"use client";

import { useEffect } from "react";

export function ConsoleEasterEgg() {
  useEffect(() => {
    const art = String.raw`
  _  __          _   _      _      _____ _   _ ______
 | |/ /    /\   | \ | |    | |    |_   _| \ | |  ____|
 | ' /    /  \  |  \| | ___| | __   | | |  \| | |__
 |  <    / /\ \ | . \` |/ _ \ |/ /   | | | . \` |  __|
 | . \  / ____ \| |\  |  __/   <   _| |_| |\  | |____
 |_|\_\/_/    \_\_| \_|\___|_|\_\ |_____|_| \_|______|
`;

    // Easter egg for developers.
    console.log("%c%s", "color:#22c55e;font-weight:700;", art);
    console.log("%cBackend mode unlocked. Curious? Watch this:", "color:#e5e7eb;");
    console.log("%chttps://www.youtube.com/watch?v=Aq5WXmQQooo", "color:#60a5fa;");
  }, []);

  return null;
}
