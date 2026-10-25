import { useCallback, useLayoutEffect, useState } from 'react';
import { DEFAULT_SKIN_ID, getSkin, isSkinId, type SkinId } from '../skins';

const STORAGE_KEY = '4link.skin.v1';

function load(): SkinId {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return isSkinId(raw) ? raw : DEFAULT_SKIN_ID;
  } catch {
    return DEFAULT_SKIN_ID;
  }
}

/** 把皮肤变量写到 :root，并记住选择。 */
export function useSkin() {
  const [skinId, setSkinId] = useState<SkinId>(load);

  useLayoutEffect(() => {
    const skin = getSkin(skinId);
    const root = document.documentElement;
    for (const [name, value] of Object.entries(skin.vars)) {
      root.style.setProperty(name, value);
    }
    try {
      localStorage.setItem(STORAGE_KEY, skinId);
    } catch {
      // 隐私模式下忽略
    }
  }, [skinId]);

  const choose = useCallback((id: SkinId) => setSkinId(id), []);

  return { skinId, skin: getSkin(skinId), setSkinId: choose };
}
