export type ConfirmationCopy = {
  title: string;
  message: string;
  confirmText: string;
};

const CONTINUE = '¿Quieres continuar?';

function joinBlocks(...parts: (string | undefined | false)[]): string {
  return parts.filter((p): p is string => typeof p === 'string' && p.trim().length > 0).join('\n\n');
}


export function copyCreate(opts: {
  resourceWord: string;
  resourcePhrase: string;
  name: string;
  detail?: string;
}): ConfirmationCopy {
  const { resourceWord, resourcePhrase, name, detail } = opts;
  return {
    title: `¿Crear ${resourceWord}?`,
    message: joinBlocks(
      `Vas a crear ${resourcePhrase} «${name}».`,
      detail,
      CONTINUE,
    ),
    confirmText: 'Sí, crear',
  };
}

/** Guardar cambios (edición). */
export function copyUpdate(opts: {
  resourcePhrase: string;
  name: string;
  note?: string;
}): ConfirmationCopy {
  const { resourcePhrase, name, note } = opts;
  return {
    title: '¿Guardar cambios?',
    message: joinBlocks(
      `Vas a guardar los cambios en ${resourcePhrase} «${name}».`,
      note,
      CONTINUE,
    ),
    confirmText: 'Sí, guardar',
  };
}

/** Activar / desactivar (estado). */
export function copyToggleActive(opts: {
  resourceWord: string;
  resourcePhrase: string;
  name: string;
  turningOff: boolean;
  offDetail: string;
  onDetail: string;
}): ConfirmationCopy {
  const { resourceWord, resourcePhrase, name, turningOff, offDetail, onDetail } = opts;
  const verb = turningOff ? 'desactivar' : 'activar';
  const detail = turningOff ? offDetail : onDetail;
  return {
    title: turningOff ? `¿Desactivar ${resourceWord}?` : `¿Activar ${resourceWord}?`,
    message: joinBlocks(
      `Vas a ${verb} ${resourcePhrase} «${name}».`,
      detail,
      CONTINUE,
    ),
    confirmText: turningOff ? 'Sí, desactivar' : 'Sí, activar',
  };
}

/** Archivar / desarchivar. */
export function copyArchive(opts: {
  resourceWord: string;
  resourcePhrase: string;
  name: string;
  unarchiving: boolean;
  archiveDetail: string;
  unarchiveDetail: string;
}): ConfirmationCopy {
  const { resourceWord, resourcePhrase, name, unarchiving, archiveDetail, unarchiveDetail } = opts;
  const verb = unarchiving ? 'desarchivar' : 'archivar';
  const detail = unarchiving ? unarchiveDetail : archiveDetail;
  return {
    title: unarchiving ? `¿Desarchivar ${resourceWord}?` : `¿Archivar ${resourceWord}?`,
    message: joinBlocks(
      `Vas a ${verb} ${resourcePhrase} «${name}».`,
      detail,
      CONTINUE,
    ),
    confirmText: unarchiving ? 'Sí, desarchivar' : 'Sí, archivar',
  };
}

/** Aprobar / rechazar solicitud (emprendedores, inscripciones feria, etc.). */
export function copyApproveReject(opts: {
  approving: boolean;
  body: string;
}): ConfirmationCopy {
  const { approving, body } = opts;
  return {
    title: approving ? '¿Aprobar solicitud?' : '¿Rechazar solicitud?',
    message: joinBlocks(body, CONTINUE),
    confirmText: approving ? 'Sí, aprobar' : 'Sí, rechazar',
  };
}

/** Cancelación destructiva o sensible (inscripción, etc.). */
export function copyDangerAction(opts: {
  title: string;
  body: string;
  confirmText: string;
}): ConfirmationCopy {
  return {
    title: opts.title,
    message: joinBlocks(opts.body, CONTINUE),
    confirmText: opts.confirmText,
  };
}

/** Envío masivo u otra acción con resumen en el cuerpo. */
export function copyCustom(opts: {
  title: string;
  message: string;
  confirmText: string;
}): ConfirmationCopy {
  return {
    title: opts.title,
    message: opts.message.includes(CONTINUE) ? opts.message : joinBlocks(opts.message, CONTINUE),
    confirmText: opts.confirmText,
  };
}
