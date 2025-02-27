export type AdjutorApiRes<D> = {
  status: string;
  message: string;
  data: D;
  meta: D;
};

export type CheckKarmaUserResData = {
  karma_identity: string;
  amount_in_contention: string;
  reason: string | null;
  karma_type: {
    karma: string;
  };
  karma_identity_type: {
    identity_type: string;
  };
  reporting_entity: {
    name: string;
    email: string;
  };
};
