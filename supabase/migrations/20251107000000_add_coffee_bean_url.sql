-- Add url column to coffee_beans table
ALTER TABLE coffee_beans
ADD COLUMN url TEXT;

-- Add a comment to the column
COMMENT ON COLUMN coffee_beans.url IS 'URL for the coffee bean product page';
