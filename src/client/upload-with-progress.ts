export type UploadLogoProgressPhase = "sending" | "storing";

export type UploadTenantLogoCallbacks = {
  onUploadProgress?: (percentLoaded: number) => void;
  onPhase?: (phase: UploadLogoProgressPhase) => void;
};

function parseLogoUploadResponse(xhr: XMLHttpRequest): { logoUrl: string } {
  let data: { error?: string; logoUrl?: string } | null = null;
  try {
    if (typeof xhr.response === "string") {
      data = JSON.parse(xhr.response) as { error?: string; logoUrl?: string };
    } else if (xhr.response && typeof xhr.response === "object") {
      data = xhr.response as { error?: string; logoUrl?: string };
    }
  } catch {
    data = null;
  }
  const status = xhr.status;
  if (status >= 200 && status < 300 && data?.logoUrl) {
    return { logoUrl: data.logoUrl };
  }
  if (status === 401) {
    throw new Error(
      "Não autorizado a enviar o logo. Conclua a configuração do abrigo ou verifique se a sessão ainda é válida.",
    );
  }
  const msg =
    typeof data?.error === "string" ? data.error : "Falha no upload do logo";
  throw new Error(msg);
}

export function uploadTenantBrandingLogoWithProgress(opts: {
  baseUrl: string;
  file: File;
  brandName: string;
  getToken: () => string | null;
  callbacks?: UploadTenantLogoCallbacks;
  timeoutMs?: number;
}): Promise<{ logoUrl: string }> {
  const {
    baseUrl,
    file,
    brandName,
    getToken,
    callbacks,
    timeoutMs = 120_000,
  } = opts;
  const root = baseUrl.replace(/\/+$/, "");
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${root}/tenant/branding/logo`);
    xhr.withCredentials = true;
    const token = getToken();
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    xhr.responseType = "json";
    xhr.timeout = timeoutMs;

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable && callbacks?.onUploadProgress) {
        const pct = Math.round((ev.loaded / Math.max(ev.total, 1)) * 100);
        callbacks.onUploadProgress(Math.min(100, pct));
      }
    };

    xhr.upload.onload = () => {
      callbacks?.onPhase?.("storing");
    };

    xhr.onload = () => {
      try {
        resolve(parseLogoUploadResponse(xhr));
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Falha de rede ao enviar o logo"));
    };

    xhr.ontimeout = () => {
      reject(new Error("Tempo esgotado ao enviar o logo. Tente de novo."));
    };

    callbacks?.onPhase?.("sending");
    const form = new FormData();
    form.append("file", file);
    form.append("brandName", brandName.trim());
    xhr.send(form);
  });
}
