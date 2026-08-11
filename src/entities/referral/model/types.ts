export type Member = {
  id: string;
  /** Личный оборот участника в центах. Команда считается по поддереву. */
  volume: number;
  children: Member[];
};
