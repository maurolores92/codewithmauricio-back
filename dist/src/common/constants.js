"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOfPayers = exports.StatusIntegrations = exports.Integrations = exports.StateDetails = exports.Status = void 0;
var Status;
(function (Status) {
    Status[Status["INACTIVE"] = 0] = "INACTIVE";
    Status[Status["ACTIVE"] = 1] = "ACTIVE";
    Status[Status["DELETED"] = 2] = "DELETED";
})(Status || (exports.Status = Status = {}));
exports.StateDetails = {
    [Status.INACTIVE]: { id: Status.INACTIVE, name: "Inactivo", color: "warning" },
    [Status.ACTIVE]: { id: Status.ACTIVE, name: "Activo", color: "success" },
    [Status.DELETED]: { id: Status.DELETED, name: "Borrado", color: "error" },
};
exports.Integrations = {
    AFIP: { name: 'AFIP', description: 'Integración para facturación electrónica AFIP', icon: 'arcticons:mi-afip' },
};
exports.StatusIntegrations = {
    pending: { name: 'Pendiente', color: 'warning' },
    pending_approval: { name: 'Pendiente aprobación', color: 'info' },
    active: { name: 'Activo', color: 'success' },
    deactivated: { name: 'Desactivado', color: 'error' },
    pending_information: { name: 'Pendiente información', color: 'warning' },
};
exports.TypeOfPayers = {
    monotributista: { name: 'Monotributista' },
    monotributista_responsable: { name: 'Monotributista responsable' },
    responsable_inscripto: { name: 'Responsable inscripto' },
};
//# sourceMappingURL=constants.js.map