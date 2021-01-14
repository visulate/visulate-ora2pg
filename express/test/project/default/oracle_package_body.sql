
  CREATE OR REPLACE EDITIONABLE PACKAGE BODY "RNTMGR2"."RNT_ACCOUNTS_PKG" as

-------------------------------------------------
--  Private Procedures and Functions
-------------------------------------------------

  procedure lock_row( X_ACCOUNT_ID IN RNT_ACCOUNTS.ACCOUNT_ID%TYPE ) is
     cursor c is
     select * from RNT_ACCOUNTS
     where ACCOUNT_ID = X_ACCOUNT_ID
     for update nowait;

  begin
    open c;
    close c;
  exception
    when OTHERS then
      if SQLCODE = -54 then
        RAISE_APPLICATION_ERROR(-20001, 'Cannot changed record. Record is locked.');
      end if;
  end lock_row;

-------------------------------------------------
--  Public Procedures and Functions
-------------------------------------------------

  function get_checksum(X_ACCOUNT_ID IN RNT_ACCOUNTS.ACCOUNT_ID%TYPE)
    return RNT_ACCOUNTS_V.CHECKSUM%TYPE
  is
    v_return_value    RNT_ACCOUNTS_V.CHECKSUM%TYPE;
  begin
    select CHECKSUM
    into v_return_value
    from RNT_ACCOUNTS_V
    where ACCOUNT_ID = X_ACCOUNT_ID;
    return v_return_value;
  end get_checksum;

  function insert_row( X_ACCOUNT_NUMBER IN RNT_ACCOUNTS.ACCOUNT_NUMBER%TYPE
                     , X_BUSINESS_ID IN RNT_ACCOUNTS.BUSINESS_ID%TYPE
                     , X_NAME IN RNT_ACCOUNTS.NAME%TYPE
                     , X_ACCOUNT_TYPE IN RNT_ACCOUNTS.ACCOUNT_TYPE%TYPE
                     , X_CURRENT_BALANCE_YN IN RNT_ACCOUNTS.CURRENT_BALANCE_YN%TYPE
                     , X_USER_ASSIGN_ID IN RNT_ACCOUNTS.USER_ASSIGN_ID%TYPE
                     , X_PEOPLE_BUSINESS_ID IN RNT_ACCOUNTS.PEOPLE_BUSINESS_ID%TYPE
  ) return RNT_ACCOUNTS.ACCOUNT_ID%TYPE
  is
    l_return_value    RNT_ACCOUNTS.ACCOUNT_ID%TYPE;
  begin
    insert into RNT_ACCOUNTS
    ( ACCOUNT_ID
    , ACCOUNT_NUMBER
    , BUSINESS_ID
    , NAME
    , ACCOUNT_TYPE
    , CURRENT_BALANCE_YN
    , USER_ASSIGN_ID
    , PEOPLE_BUSINESS_ID
    ) values
    ( RNT_ACCOUNTS_SEQ.NEXTVAL
    , X_ACCOUNT_NUMBER
    , X_BUSINESS_ID
    , X_NAME
    , X_ACCOUNT_TYPE
    , X_CURRENT_BALANCE_YN
    , X_USER_ASSIGN_ID
    , X_PEOPLE_BUSINESS_ID
    ) returning ACCOUNT_ID into l_return_value;

    return l_return_value;
  end insert_row;

  function get_row( X_ACCOUNT_ID IN RNT_ACCOUNTS.ACCOUNT_ID%TYPE)
    return RNT_ACCOUNTS_V%ROWTYPE
  is
    l_row_rec RNT_ACCOUNTS_V%ROWTYPE;
  begin
    select *
    into l_row_rec
    from RNT_ACCOUNTS_V
    where ACCOUNT_ID = X_ACCOUNT_ID;

    return l_row_rec;
  end get_row;

  procedure update_row( X_ACCOUNT_ID IN RNT_ACCOUNTS.ACCOUNT_ID%TYPE
                      , X_ACCOUNT_NUMBER IN RNT_ACCOUNTS.ACCOUNT_NUMBER%TYPE
                      , X_BUSINESS_ID IN RNT_ACCOUNTS.BUSINESS_ID%TYPE
                      , X_NAME IN RNT_ACCOUNTS.NAME%TYPE
                      , X_ACCOUNT_TYPE IN RNT_ACCOUNTS.ACCOUNT_TYPE%TYPE
                      , X_CURRENT_BALANCE_YN IN RNT_ACCOUNTS.CURRENT_BALANCE_YN%TYPE
                      , X_USER_ASSIGN_ID IN RNT_ACCOUNTS.USER_ASSIGN_ID%TYPE
                      , X_PEOPLE_BUSINESS_ID IN RNT_ACCOUNTS.PEOPLE_BUSINESS_ID%TYPE
                      , X_CHECKSUM IN RNT_ACCOUNTS_V.CHECKSUM%TYPE )
  is
    l_checksum       RNT_ACCOUNTS_V.CHECKSUM%TYPE;
  begin
    lock_row(X_ACCOUNT_ID);
    -- validate checksum
    l_checksum := get_checksum(X_ACCOUNT_ID);
    if X_CHECKSUM != l_checksum then
      RAISE_APPLICATION_ERROR(-20002, 'Record has been changed another user.');
    end if;

    update RNT_ACCOUNTS
    set ACCOUNT_ID = X_ACCOUNT_ID
    ,   ACCOUNT_NUMBER = X_ACCOUNT_NUMBER
    ,   BUSINESS_ID = X_BUSINESS_ID
    ,   NAME = X_NAME
    ,   ACCOUNT_TYPE = X_ACCOUNT_TYPE
    ,   CURRENT_BALANCE_YN = X_CURRENT_BALANCE_YN
    ,   USER_ASSIGN_ID = X_USER_ASSIGN_ID
    ,   PEOPLE_BUSINESS_ID = X_PEOPLE_BUSINESS_ID
    where ACCOUNT_ID = X_ACCOUNT_ID;
  end update_row;

  procedure delete_row( X_ACCOUNT_ID IN RNT_ACCOUNTS.ACCOUNT_ID%TYPE)
  is
  begin
    delete from RNT_ACCOUNTS
    where ACCOUNT_ID = X_ACCOUNT_ID;
  end delete_row;

end RNT_ACCOUNTS_PKG;
