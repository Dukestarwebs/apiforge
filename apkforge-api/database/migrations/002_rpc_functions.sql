-- RPC Functions for atomic credit operations

CREATE OR REPLACE FUNCTION add_credits(p_user_id UUID, p_amount INTEGER)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE wallets SET balance = balance + p_amount, updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION deduct_credits(p_user_id UUID, p_amount INTEGER)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF (SELECT balance FROM wallets WHERE user_id = p_user_id) < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
  UPDATE wallets SET balance = balance - p_amount, updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_builds_used(p_user_id UUID)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE subscriptions SET builds_used = builds_used + 1, updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;
