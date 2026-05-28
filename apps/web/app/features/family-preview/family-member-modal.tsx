import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

interface FamilyMemberModalProps {
  onClose: () => void;
  open: boolean;
}

export function FamilyMemberModal({ onClose, open }: FamilyMemberModalProps) {
  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>Ajouter un membre</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            autoFocus
            defaultValue="Camille"
            fullWidth
            id="new-member-first-name"
            label="Prénom"
          />
          <TextField
            defaultValue="Parent"
            fullWidth
            id="new-member-role"
            label="Rôle"
          />
          <TextField
            defaultValue="Pro. Camille"
            fullWidth
            id="new-member-category"
            label="Catégorie pro."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={onClose} variant="contained">
          Ajouter
        </Button>
      </DialogActions>
    </Dialog>
  );
}
